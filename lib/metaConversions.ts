import { createHash } from "crypto";

type MetaPurchaseInput = {
  eventId: string;
  value: number;
  contentIds: string[];
  numItems: number;
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
};

const sha256 = (value: string) =>
  createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

export async function sendMetaPurchaseEvent(input: MetaPurchaseInput) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken =
    process.env.META_CONVERSIONS_API_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    return;
  }

  const userData: Record<string, string> = {};
  if (input.email) userData.em = sha256(input.email);
  if (input.phone) userData.ph = sha256(input.phone.replace(/\D/g, ""));
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.clientIpAddress) userData.client_ip_address = input.clientIpAddress;
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent;

  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();
  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.eventSourceUrl,
        user_data: userData,
        custom_data: {
          currency: "PKR",
          value: input.value,
          content_ids: input.contentIds,
          content_type: "product",
          num_items: input.numItems,
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const version = process.env.META_GRAPH_API_VERSION || "v20.0";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let response: Response;
  try {
    response = await fetch(
      `https://graph.facebook.com/${version}/${pixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Meta Conversions API request failed: ${response.status}`);
  }
}
