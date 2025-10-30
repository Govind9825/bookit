import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
    const keySecret = process.env.RAZORPAY_KEY_SECRET || ""
    if (!keySecret) return Response.json({ success: false, error: "Razorpay secret not configured" }, { status: 500 })
    const hmac = crypto.createHmac("sha256", keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const expected = hmac.digest("hex")
    const valid = expected === razorpay_signature
    return Response.json({ success: valid })
  } catch (e: any) {
    return Response.json({ success: false, error: e?.message || "Verification failed" }, { status: 500 })
  }
}


