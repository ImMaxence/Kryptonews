module.exports = app => {
  const user = require("../controllers/user.controller.js");
  var router = require("express").Router();
  const { verifySignUp } = require("../middleware");

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post(
    "/register",
    [
      verifySignUp.checkDuplicateUsernameOrEmail
      //   verifySignUp.checkRolesExisted
    ],
    user.register
  );

  // router.get("/profile", user.profileGet);
  router.post("/login", user.login);
  router.post("/logout", user.logout);
  router.get("/auth/:provider", user.oauth);
  router.put("/update/:id", user.update);
  router.get("/oneUser/:id", user.oneUser);
  router.delete("/:id", user.delete);

  app.use('/api/users', router);
};