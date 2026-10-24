const { createClient } = require("@supabase/supabase-js");

// Verify the user's Supabase access token.
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    }
);

// Authenticate the user before allowing access to protected routes.
async function authenticateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Please log in to continue."
            });
        }

        const accessToken = authHeader.slice(7).trim();

        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Your login session is missing."
            });
        }

        const { data, error } =
            await supabaseAuth.auth.getUser(accessToken);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Your login session is invalid or expired. Please log in again."
            });
        }

        // Make the authenticated user available to the route.
        req.user = data.user;

        next();
    } catch (error) {
        console.error("Authentication middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify your login session."
        });
    }
}

module.exports = authenticateUser;