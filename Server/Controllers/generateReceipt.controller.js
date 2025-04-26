const nodemailer = require("nodemailer");
const path = require('path');
const puppeteer = require("puppeteer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateReceipt = async (req, res) => {
  try {
    const { paymentMode, amount, email, name, phone, items } = req.body;

    if (!paymentMode || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Purchase Receipt',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; padding: 40px; text-align: center; color: #333;">
          <h1 style="color: #4CAF50;">Thank You for Your Purchase!</h1>
          <p style="font-size: 18px; color: #555;">Dear ${name},</p>
          <p style="font-size: 16px; color: #777;">We sincerely appreciate your order and trust in us. Your purchase has been successfully completed. Below is the receipt for your reference.</p>
          <hr style="border: 1px solid #ddd; margin: 30px 0;" />
          
          <h3 style="color: #4CAF50;">Receipt Details</h3>
          <p><strong>Amount Paid:</strong> ₹${amount}</p>
          <p><strong>Payment Method:</strong> ${paymentMode}</p>

          <div style="margin-top: 40px; font-style: italic; font-size: 16px; color: #777;">
            <p>Thank you for shopping with us! We hope to serve you again soon.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${name}}.pdf`,
          content: await generatPdf({ name, email, phone, amount, items }),
          contentType: 'application/pdf'
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({
        message: "Receipt generated and sent successfully",
        receipt: {
          amount,
          email,
          name,
          phone,
        },
      });
    })

  } catch (error) {
    console.error("Error generating receipt:", error);
    return res.status(500).json({ error: error.message });
  }
}


const generatPdf = async ({ name, email, phone, amount, items }) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
  <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Purchase Receipt</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #eef2f5;
            margin: 0;
            padding: 40px;
            color: #333;
          }

          .receipt-container {
            max-width: 800px;
            margin: auto;
            background-color: #fff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          h1 {
            text-align: center;
            color: #4CAF50;
            margin-bottom: 10px;
            font-size: 32px;
          }

          .company-info {
            text-align: center;
            margin-bottom: 30px;
          }

          .company-info h2 {
            margin: 0;
            font-size: 24px;
            color: #222;
          }

          .company-info p {
            margin: 4px 0;
            font-size: 14px;
            color: #555;
          }

          .section {
            margin-bottom: 25px;
          }

          .section strong {
            color: #111;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #ddd;
            padding: 14px;
            text-align: center;
            font-size: 15px;
          }

          th {
            background-color: #f8f8f8;
            color: #555;
            font-weight: 600;
          }

          tr:nth-child(even) {
            background-color: #fafafa;
          }

          tr:hover {
            background-color: #f1f1f1;
          }

          .total {
            font-weight: bold;
            background-color: #e9f7ef;
            color: #2e7d32;
          }

          .thank-you {
            margin-top: 40px;
            text-align: center;
            font-style: italic;
            font-size: 16px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <h1>Purchase Receipt</h1>

          <div class="company-info">
            <h2>Ganesh Kala Bhanav</h2>
            <p>Patel Pada, Dahanu, Maharashtra, 401602</p>
            <p>contact@ganeshkalabhavan.com</p>
          </div>

          <div class="section receipt-details">
            <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
          </div>

          <div class="section customer-details">
            <strong>Customer:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Phone:</strong> ${phone}<br>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price (INR)</th>
                <th>Total (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(({ title, quantity, price, total }, index) => (
    `<tr>
                    <td>${title}</td>
                    <td>${quantity}</td>
                    <td>${price}</td>
                    <td>${total}</td>
                  </tr>`
  ))}
              <tr>
                <td colspan="3" class="total">Grand Total</td>
                <td class="total">₹${amount}</td>
              </tr>
            </tbody>
          </table>

          <div class="thank-you">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
    </html>`;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdfBuffer;
}

module.exports = { generateReceipt };
