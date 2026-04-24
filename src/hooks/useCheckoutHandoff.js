import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function rowToPending(r) {
  return {
    id: r.id,
    customerId: r.customer_id,
    restaurantId: r.restaurant_id,
    staffId: r.staff_id,
    staffName: r.staff_name,
    items: r.items ?? [],
    subtotal: Number(r.subtotal ?? 0),
    tax: Number(r.tax ?? 0),
    tip: Number(r.tip ?? 0),
    total: Number(r.total ?? 0),
    redeemAmt: Number(r.redeem_amt ?? 0),
    redeemOn: Boolean(r.redeem_on),
    earned: Number(r.earned ?? 0),
    signature: r.signature,
    status: r.status,
    finalOrderId: r.final_order_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/* ── Customer side — watch for incoming pending transactions ────── */
export function useIncomingCheckout(customerId) {
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;

    async function fetchLatest() {
      const { data } = await supabase
        .from('pending_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'awaiting_customer')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) setPending(data ? rowToPending(data) : null);
    }
    fetchLatest();

    const ch = supabase
      .channel(`pending_tx_customer_${customerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pending_transactions', filter: `customer_id=eq.${customerId}` },
        () => fetchLatest()
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [customerId]);

  async function approve({ tip, redeemOn, redeemAmt, total, earned, signature }) {
    if (!pending) return null;
    const { data, error } = await supabase
      .from('pending_transactions')
      .update({
        tip, redeem_on: redeemOn, redeem_amt: redeemAmt,
        total, earned, signature,
        status: 'customer_approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', pending.id)
      .select()
      .single();
    if (error) { console.error('approve failed', error); return null; }
    return rowToPending(data);
  }

  async function decline() {
    if (!pending) return;
    await supabase.from('pending_transactions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', pending.id);
  }

  return { pending, approve, decline };
}

/* ── Staff side — create pending tx + watch for customer approval ── */
export function useOutgoingCheckout() {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pending?.id) return;
    const ch = supabase
      .channel(`pending_tx_staff_${pending.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pending_transactions', filter: `id=eq.${pending.id}` },
        (payload) => setPending(rowToPending(payload.new))
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [pending?.id]);

  const send = useCallback(async ({
    customerId, restaurantId, staffId, staffName,
    items, subtotal, tax, earned,
  }) => {
    setError(null);
    const row = {
      customer_id: customerId,
      restaurant_id: restaurantId,
      staff_id: staffId ?? null,
      staff_name: staffName ?? null,
      items,
      subtotal, tax, earned,
      total: subtotal + tax,
      status: 'awaiting_customer',
    };
    const { data, error: insErr } = await supabase
      .from('pending_transactions')
      .insert(row)
      .select()
      .single();
    if (insErr) {
      console.error('send failed', insErr);
      setError(insErr.message || 'Failed to send bill');
      return null;
    }
    const p = rowToPending(data);
    setPending(p);
    return p;
  }, []);

  const markCompleted = useCallback(async (finalOrderId) => {
    if (!pending?.id) return;
    await supabase.from('pending_transactions')
      .update({ status: 'completed', final_order_id: finalOrderId, updated_at: new Date().toISOString() })
      .eq('id', pending.id);
  }, [pending?.id]);

  const cancel = useCallback(async () => {
    if (!pending?.id) return;
    await supabase.from('pending_transactions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', pending.id);
    setPending(null);
  }, [pending?.id]);

  const reset = useCallback(() => { setPending(null); setError(null); }, []);

  return { pending, error, send, markCompleted, cancel, reset };
}
