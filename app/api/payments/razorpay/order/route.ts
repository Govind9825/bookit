export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR", receipt } = await request.json()
    const keyId = process.env.RAZORPAY_KEY_ID || ""
    const keySecret = process.env.RAZORPAY_KEY_SECRET || ""
    if (!keyId || !keySecret) {
      return Response.json({ success: false, error: "Razorpay keys not configured" }, { status: 500 })
    }
    if (!amount || amount <= 0) {
      return Response.json({ success: false, error: "Invalid amount" }, { status: 400 })
    }
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")
    const safeReceipt = (receipt || `ord_${Date.now()}`).toString().slice(0, 40)
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, currency, receipt: safeReceipt, payment_capture: 1 }),
    })
    const data = await res.json()
    if (!res.ok) {
      return Response.json({ success: false, error: data?.error?.description || "Failed to create order" }, { status: 500 })
    }
    return Response.json({ success: true, data: { orderId: data.id, amount: data.amount, currency: data.currency, keyId } })
  } catch (e: any) {
    return Response.json({ success: false, error: e?.message || "Failed to create order" }, { status: 500 })
  }
}


