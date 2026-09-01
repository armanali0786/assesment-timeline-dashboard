import { useNavigate } from "react-router-dom";
import { AppBar, Avatar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useAuth } from "@/auth/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bgcolor="grey.50">
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Timeline Dashboard
          </Typography>
          {user && (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ width: 32, height: 32 }}>{user.name.charAt(0).toUpperCase()}</Avatar>
              <Typography variant="body2">{user.name}</Typography>
            </Box>
          )}
          <Button onClick={handleLogout} size="small">
            Log out
          </Button>
        </Toolbar>
      </AppBar>
      <Box flex={1} p={2}>
        {children}
      </Box>
    </Box>
  );
}
