const promoCodes: Record<string, number> = {
  SAVE10: 0.1,
  FLAT100: 100,
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return Response.json({ success: false, error: "Promo code is required" }, { status: 400 })
    }

    const upperCode = code.toUpperCase()
    if (!(upperCode in promoCodes)) {
      return Response.json({ success: false, error: "Invalid promo code" }, { status: 400 })
    }

    const discountValue = promoCodes[upperCode]
    let discount = 0

    if (typeof discountValue === "number" && discountValue < 1) {
      // Percentage discount
      discount = Math.round(subtotal * discountValue)
    } else {
      // Flat discount
      discount = discountValue
    }

    return Response.json({
      success: true,
      data: {
        code: upperCode,
        discount,
        type: discountValue < 1 ? "percentage" : "flat",
      },
    })
  } catch {
    return Response.json({ success: false, error: "Failed to validate promo code" }, { status: 500 })
  }
}
