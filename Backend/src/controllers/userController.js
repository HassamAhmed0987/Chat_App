import User from "../models/user.js";



export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};



export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id }
    })
      .select("name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};