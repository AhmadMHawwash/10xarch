import { type NextApiRequest, type NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Received webhook request to minimal endpoint");
  
  // Log all headers
  console.log("Headers:", JSON.stringify(req.headers));
  
  // Log request body
  console.log("Body:", JSON.stringify(req.body));
  
  // Return simple success response
  return res.status(200).json({ success: true });
} 