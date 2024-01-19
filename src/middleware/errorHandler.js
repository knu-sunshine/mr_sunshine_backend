const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ result: "fail", error: `Internal Server Error ${err}` });
  };
  
  module.exports = errorHandler;