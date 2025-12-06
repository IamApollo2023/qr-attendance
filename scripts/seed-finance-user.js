/**
 * Seed Finance User Script
 * Creates a user with email financial@test.com, password financial123, and finance role
 *
 * IMPORTANT: Before running this script, update the database constraint!
 * Run this SQL first: update-user-profiles-constraint.sql
 *
 * Usage:
 *   node scripts/seed-finance-user.js
 *
 * Requires:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_ROLE_KEY environment variable (from Supabase Dashboard > Settings > API)
 */

const { createClient } = require("@supabase/supabase-js");

async function seedFinanceUser() {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Missing required environment variables");
    console.error("Please set:");
    console.error("  - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
    console.error("  - SUPABASE_SERVICE_ROLE_KEY");
    console.error(
      "\nGet SUPABASE_SERVICE_ROLE_KEY from: Supabase Dashboard > Settings > API > service_role key"
    );
    process.exit(1);
  }

  // Create Supabase admin client (uses service_role key for admin operations)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const email = "financial@test.com";
  const password = "financial123";

  try {
    console.log(`Creating user: ${email}...`);

    // Create the user in auth.users
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
      });

    if (authError) {
      // If user already exists, that's okay - we'll just update the role
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("already exists")
      ) {
        console.log("User already exists, fetching user ID...");

        // Get the existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser?.users?.find((u) => u.email === email);

        if (!user) {
          throw new Error("User exists but could not be found");
        }

        // Update the user profile role
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ role: "finance" })
          .eq("email", email);

        if (updateError) {
          throw updateError;
        }

        console.log("✓ User profile updated successfully!");
        console.log(`  User ID: ${user.id}`);
        console.log(`  Email: ${email}`);
        console.log(`  Role: finance`);
        return;
      }

      throw authError;
    }

    if (!authData?.user) {
      throw new Error("User creation succeeded but no user data returned");
    }

    console.log("✓ User created successfully!");
    console.log(`  User ID: ${authData.user.id}`);

    // Update the user profile role (the trigger creates it with 'scanner' by default)
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ role: "finance" })
      .eq("id", authData.user.id);

    if (updateError) {
      console.warn(
        "Warning: User created but failed to update role:",
        updateError.message
      );
      console.warn("You may need to manually update the role in the database.");
      throw updateError;
    }

    console.log("✓ User profile role set to finance!");
    console.log("\nLogin credentials:");
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Role: finance`);
  } catch (error) {
    console.error("Error seeding finance user:", error.message);
    process.exit(1);
  }
}

seedFinanceUser();
