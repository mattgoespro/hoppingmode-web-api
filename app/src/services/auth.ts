import jwt from "jsonwebtoken";

export const handleLogin = (jwtSigningKey: string) => {
  return (req, res) => {
    const client: string = req.body.client;

    if (client != null) {
      // Generate an access token
      const accessToken = jwt.sign({ client }, jwtSigningKey);
      res.json({ accessToken });
    } else {
      res.status(401).json({ status: "Forbidden" });
    }
  };
};

export const authenticateJWT = (jwtSigningKey: string) => {
  return (req, res, next) => {
    console.log(jwtSigningKey);
    const authHeader = req.headers.authorization;

    if (authHeader != null) {
      const token = authHeader.split(" ")[1];
      console.log(token);

      jwt.verify(token, jwtSigningKey, (err: any, client: any) => {
        if (err != null) {
          return res.status(401).json({ status: "Forbidden" });
        }

        req.client = client;
        next();
      });
    } else {
      return res.status(401).json({ status: "Forbidden" });
    }
  };
};
