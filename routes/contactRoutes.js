
const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");

// ==========================
// CREATE CONTACT MESSAGE
// POST /api/contact
// ==========================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !phone ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Create contact
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      contact,
    });
  } catch (error) {
    console.error(
      "Contact API Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error. Please try again.",
    });
  }
});


// ==========================
// GET ALL CONTACTS
// GET /api/contact
// ==========================

router.get("/", async (req, res) => {
  try {
    const contacts =
      await Contact.find().sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error(
      "Get Contacts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch contacts.",
    });
  }
});


// ==========================
// DELETE CONTACT
// DELETE /api/contact/:id
// ==========================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const contact =
      await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message:
          "Contact message not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Contact Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete contact message.",
    });
  }
});


// ==========================
// EXPORT ROUTER
// ==========================

module.exports = router;

