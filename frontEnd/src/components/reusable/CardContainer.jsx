import React from "react";
import { Card, CardContent, CardHeader, Typography, Box, Divider } from "@mui/material";

const CardContainer = ({
  title,
  subtitle,
  icon,
  action,
  children,
  elevation = 1,
  headerDivider = true,
  sx = {},
  headerSx = {},
  contentSx = {},
}) => (
  <Card
    elevation={elevation}
    sx={{
      borderRadius: '12px',
      overflow: 'visible',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'background.paper',
      margin: '0',
      width: '100%',
      ...sx,
    }}
  >
    {title && (
      <>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <Box sx={{ mr: 1.5, color: 'primary.main' }}>
                  {icon}
                </Box>
              )}
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                {title}
              </Typography>
            </Box>
          }
          subheader={
            subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )
          }
          action={action}
          sx={{
            padding: '16px 20px',
            '& .MuiCardHeader-action': {
              margin: 0,
              alignSelf: 'center',
            },
            ...headerSx,
          }}
        />
        {headerDivider && <Divider />}
      </>
    )}
    <CardContent
      sx={{
        padding: '20px',
        flexGrow: 1,
        '&:last-child': {
          paddingBottom: '20px',
        },
        ...contentSx,
      }}
    >
      {children}
    </CardContent>
  </Card>
);

export default CardContainer; 