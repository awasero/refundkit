import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 },
    );
  }

  try {
    // Read body for signature verification
    await request.text();

    // TODO: validate signature with stripe.webhooks.constructEvent
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    // TODO: handle refund events
    // switch (event.type) {
    //   case 'charge.refund.updated':
    //     // Update refund status in database
    //     break;
    // }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}
