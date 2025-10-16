// import * as checkoutService from "../services/checkoutService.js";

// export async function previewCheckout(req, res) {
//   try {
//     const token = req.headers.authorization;
//     const userId = req.user.userId;

//     const preview = await checkoutService.previewCheckout(userId, token);
//     res.json({ success: true, data: preview });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ success: false, message: err.message });
//   }
// }

// export async function placeOrder(req, res) {
//   try {
//     const token = req.headers.authorization;
//     const userId = Number(req.user.userId);

//     const order = await checkoutService.placeOrder(userId, token);
//     res.status(201).json({ success: true, data: order });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ success: false, message: err.message });
//   }
// }


import * as checkoutService from "../services/checkoutService.js";

// Preview checkout
export async function previewCheckout(req, res) {
  try {
    const token = req.headers.authorization;
    const userId = req.user.userId;
    console.log(token,"token from headers")
    const preview = await checkoutService.previewCheckout(userId, token);
    res.status(200).json({ success: true, data: preview });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
}

// Place order
export async function placeOrder(req, res) {
  try {
    const userId = Number(req.user.userId);

    const order = await checkoutService.placeOrder(userId);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
}

