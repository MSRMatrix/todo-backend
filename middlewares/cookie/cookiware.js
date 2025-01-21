export const checkCookie = async (req, res, next) => {
    const cookie = req.cookies.jwt;
    try {
      if (cookie) {   
        next()
      } else {
        res.status(404).send("Cookie not found!");
      }
    } catch (error) {
      next(error);
    }
  };