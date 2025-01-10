const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - headers:', req.headers);
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        console.log('Verifying token:', token);
        const decoded = jwt.verify(token, 'your_jwt_secret');
        console.log('Decoded token:', decoded);

        if (!decoded.id) {
            console.log('No user ID in token');
            return res.status(401).json({ message: 'Invalid token format' });
        }

        req.user = { id: decoded.id };
        console.log('User set in request:', req.user);
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
