export default function handler(req, res) {
  res.status(200).json({ pong: true, ts: Date.now() });
}
