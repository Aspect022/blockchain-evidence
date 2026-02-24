const { ethers } = require('ethers');

const verifySignature = (req, res, next) => {
  try {
    let claimedWallet =
      req.body.userWallet ||
      req.query.userWallet ||
      req.body.adminWallet ||
      req.query.adminWallet;

    if (!claimedWallet && req.path.includes('/login/wallet') && req.body.walletAddress) {
      claimedWallet = req.body.walletAddress;
    }

    // Only apply cryptographic verification to endpoints that rely on wallet authentication
    if (!claimedWallet) {
      return next();
    }

    if (typeof claimedWallet !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet format' });
    }

    const { signature, message } = req.headers;

    if (!signature || !message) {
      return res.status(401).json({
        error: 'Authentication required. Missing message or signature in headers.',
      });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== claimedWallet.toLowerCase()) {
      return res.status(403).json({ error: 'Cryptographic signature does not match claimed wallet' });
    }

    req.authenticatedWallet = recoveredAddress.toLowerCase();
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(401).json({ error: 'Invalid cryptographic signature' });
  }
};

module.exports = { verifySignature };
