export async function sendEmail({ email, appPassword, to, subject, message }) {
  const res = await fetch("http://localhost:5000/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, appPassword, to, subject, message }),
  });

  return await res.json();
}
