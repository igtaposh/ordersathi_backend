import jwt from 'jsonwebtoken';


export const authMid = (req, res, next) => {
   const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

   if (!token) return res.status(401).json({ msg: "No token, access denied" });

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;
      next();
   } catch (err) {
      res.status(401).json({ msg: "Invalid token" });
   }
};