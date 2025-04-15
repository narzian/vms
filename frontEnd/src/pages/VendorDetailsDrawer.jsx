import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CircleIcon from "@mui/icons-material/Circle";
import { validate } from "../components/reusable/validation";

let VendorDetailsDrawer = ({ open, onClose, vendor, refreshVendors }) => {
  let [isEditing, setIsEditing] = useState(false);
  let [vendorDetails, setVendorDetails] = useState({});
  let [errors, setErrors] = useState({});

  useEffect(() => {
    if (vendor) {
      setVendorDetails({
        ...vendor,
        addresses: vendor.addresses || [],
        documents: vendor.documents || [],
      });
      if (!open) setIsEditing(false);
    }
  }, [open, vendor]);

  if (!vendor) return null;

  let handleOpenLink = (url) => {
    window.open(url, "_blank");
  };

  let handleEditClick = () => {
    setIsEditing(true);
  };

  let handleInputChange = (e) => {
    let { name, value } = e.target;
    if (name.includes("addresses")) {
      const [_, index, field] = name.split(".");
      setVendorDetails((prevDetails) => {
        const updatedAddresses = [...prevDetails.addresses];
        updatedAddresses[index] = {
          ...updatedAddresses[index],
          [field]: value,
        };
        return { ...prevDetails, addresses: updatedAddresses };
      });
    } else {
      setVendorDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validate(name, value),
    }));
  };

  let handleSave = async () => {
    const validationErrors = {};
    Object.keys(vendorDetails).forEach((key) => {
      validationErrors[key] = validate(key, vendorDetails[key]);
    });
    vendorDetails.addresses.forEach((address, index) => {
      Object.keys(address).forEach((key) => {
        validationErrors[`addresses.${index}.${key}`] = validate(
          key,
          address[key]
        );
      });
    });
    setErrors(validationErrors);

    if (Object.values(validationErrors).some((error) => error)) {
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/vendors/${vendor.vendor_id}`,
        vendorDetails
      );
      setIsEditing(false);
      onClose();
      refreshVendors(); // Refresh the vendor list
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  };

  let handleCancel = () => {
    setIsEditing(false);
    setVendorDetails({
      ...vendor,
      addresses: vendor.addresses || [],
      documents: vendor.documents || [],
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "30%",
          backdropFilter: "blur(5px)",
          backgroundColor: "white",
          color: "black",
        },
      }}
    >
      <Box sx={{ padding: 2, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
        >
          <CloseIcon />
        </IconButton>
        <IconButton
          sx={{ position: "absolute", top: 8, right: 48, color: "black" }}
          onClick={handleEditClick}
        >
          <EditIcon />
        </IconButton>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ marginTop: isEditing ? 4 : 0 }}
        >
          {isEditing ? (
            <TextField
              name="vendor_name"
              value={vendorDetails.vendor_name || ""}
              onChange={handleInputChange}
              fullWidth
              size="small"
              error={!!errors.vendor_name}
              helperText={errors.vendor_name}
            />
          ) : (
            vendor.vendor_name
          )}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "gray" }}>
            Created Date: {new Date(vendor.created_at).toLocaleDateString()}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CircleIcon
              sx={{
                color: vendor.vendor_status === "Active" ? "green" : "red",
                mr: 1,
              }}
            />
            <Typography variant="body2">{vendor.vendor_status}</Typography>
          </Box>
        </Box>
        {/* Additional fields and sections */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgb(243 244 246)",
            color: "black",
          }}
        >
          <Typography variant="body2">
            <strong>Type:</strong>{" "}
            {isEditing ? (
              <TextField
                name="vendor_type"
                value={vendorDetails.vendor_type || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.vendor_type}
                helperText={errors.vendor_type}
              />
            ) : (
              vendor.vendor_type
            )}
          </Typography>
          <Typography variant="body2">
            <strong>Tier:</strong>{" "}
            {isEditing ? (
              <TextField
                name="vendor_tier"
                value={vendorDetails.vendor_tier || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.vendor_tier}
                helperText={errors.vendor_tier}
              />
            ) : (
              vendor.vendor_tier
            )}
          </Typography>
        </Box>
        {/* More fields */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgb(243 244 246)",
            color: "black",
          }}
        >
          <Typography variant="body2">
            <strong>PAN:</strong>{" "}
            {isEditing ? (
              <TextField
                name="pan"
                value={vendorDetails.pan || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.pan}
                helperText={errors.pan}
              />
            ) : (
              vendor.pan
            )}
          </Typography>
          <Typography variant="body2">
            <strong>GSTIN:</strong>{" "}
            {isEditing ? (
              <TextField
                name="gstin"
                value={vendorDetails.gstin || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.gstin}
                helperText={errors.gstin}
              />
            ) : (
              vendor.gstin
            )}
          </Typography>
        </Box>
        {/* Contact Details */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgb(243 244 246)",
            color: "black",
          }}
        >
          <Typography variant="body2">
            <strong>Contact Details:</strong>
          </Typography>
          <Typography variant="body2" sx={{ ml: 2 }}>
            <strong>Name:</strong>{" "}
            {isEditing ? (
              <TextField
                name="primary_contact_name"
                value={vendorDetails.primary_contact_name || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.primary_contact_name}
                helperText={errors.primary_contact_name}
              />
            ) : (
              vendor.primary_contact_name
            )}
            <br />
            <strong>Phone:</strong>{" "}
            {isEditing ? (
              <TextField
                name="primary_contact_phone"
                value={vendorDetails.primary_contact_phone || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.primary_contact_phone}
                helperText={errors.primary_contact_phone}
              />
            ) : (
              vendor.primary_contact_phone
            )}
            <br />
            <strong>Email:</strong>{" "}
            {isEditing ? (
              <TextField
                name="primary_contact_email"
                value={vendorDetails.primary_contact_email || ""}
                onChange={handleInputChange}
                fullWidth
                size="small"
                error={!!errors.primary_contact_email}
                helperText={errors.primary_contact_email}
              />
            ) : (
              vendor.primary_contact_email
            )}
          </Typography>
        </Box>
        {/* Address */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgb(243 244 246)",
            color: "black",
          }}
        >
          <Typography variant="body2">
            <strong>Address:</strong>
          </Typography>
          {vendorDetails.addresses &&
            vendorDetails.addresses.map((address, index) => (
              <Box key={index} sx={{ ml: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Type:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.address_type`}
                      value={address.address_type || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.address_type`]}
                      helperText={errors[`addresses.${index}.address_type`]}
                    />
                  ) : (
                    address.address_type
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Address Line 1:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.address_line_1`}
                      value={address.address_line_1 || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.address_line_1`]}
                      helperText={errors[`addresses.${index}.address_line_1`]}
                    />
                  ) : (
                    address.address_line_1
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Address Line 2:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.address_line_2`}
                      value={address.address_line_2 || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.address_line_2`]}
                      helperText={errors[`addresses.${index}.address_line_2`]}
                    />
                  ) : (
                    address.address_line_2
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>City:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.city`}
                      value={address.city || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.city`]}
                      helperText={errors[`addresses.${index}.city`]}
                    />
                  ) : (
                    address.city
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>State:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.state`}
                      value={address.state || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.state`]}
                      helperText={errors[`addresses.${index}.state`]}
                    />
                  ) : (
                    address.state
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Zip Code:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.zip_code`}
                      value={address.zip_code || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.zip_code`]}
                      helperText={errors[`addresses.${index}.zip_code`]}
                    />
                  ) : (
                    address.zip_code
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Country:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.country`}
                      value={address.country || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.country`]}
                      helperText={errors[`addresses.${index}.country`]}
                    />
                  ) : (
                    address.country
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Based Office:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.based_office`}
                      value={address.based_office || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.based_office`]}
                      helperText={errors[`addresses.${index}.based_office`]}
                    />
                  ) : (
                    address.based_office
                  )}
                </Typography>
                <Typography variant="body2">
                  <strong>Landmark:</strong>{" "}
                  {isEditing ? (
                    <TextField
                      name={`addresses.${index}.landmark`}
                      value={address.landmark || ""}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                      error={!!errors[`addresses.${index}.landmark`]}
                      helperText={errors[`addresses.${index}.landmark`]}
                    />
                  ) : (
                    address.landmark
                  )}
                </Typography>
              </Box>
            ))}
        </Box>
        {/* Comments */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgb(243 244 246)",
            color: "black",
          }}
        >
          <Typography variant="body2">
            <strong>Comments:</strong>{" "}
            {isEditing ? (
              <TextField
                name="comments"
                value={vendorDetails.comments || ""}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
                size="small"
                error={!!errors.comments}
                helperText={errors.comments}
              />
            ) : (
              vendor.comments
            )}
          </Typography>
        </Box>
        {isEditing && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{
                backgroundColor: "black",
                borderRadius: "8px",
                textTransform: "capitalize",
                fontSize: "16px",
                height: "36px",
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              sx={{
                borderRadius: "8px",
                textTransform: "capitalize",
                fontSize: "16px",
                height: "36px",
              }}
            >
              Cancel
            </Button>
          </Box>
        )}
        {/* Documents */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgb(243 244 246)",
            color: "black",
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Documents:</strong>
          </Typography>
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: "lightgray",
              boxShadow: 0,
              borderRadius: 2,
              border: "1px solid #e0e0e0",
              maxWidth: "100%",
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Category
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorDetails.documents &&
                  vendorDetails.documents.map((document, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: "black",
                          fontSize: "1rem",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        {document.category}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenLink(document.path)}
                          sx={{
                            backgroundColor: "black",
                            borderRadius: "15px",
                            textTransform: "capitalize",
                            color: "white",
                            borderColor: "black",
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VendorDetailsDrawer;
