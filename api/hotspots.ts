import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "success",
    hotspot_clusters: [
      {
          cluster_id: "CLS-IND-01",
          center: { lat: 22.7196, lng: 75.8577 },
          radius_km: 4.5,
          complaint_count: 1420,
          risk_level: "Critical"
      }
    ]
  });
}
