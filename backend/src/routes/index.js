const router = require("express").Router();

router.use("/auth", require("./v1/auth"));
router.use("/tasks", require("./v1/tasks"));
router.use("/admin", require("./v1/admin"));

module.exports = router;
