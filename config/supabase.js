const { createClient } = require('@supabase/supabase-js');

const supabaseURL = "https://qkmqalxfgfnksshhgola.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbXFhbHhmZ2Zua3NzaGhnb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwNjU0MDcsImV4cCI6MjA0NjY0MTQwN30.odeKC84_zshUd0emaD2ESnJweOJLb1wc2TxKhngZAb4";
const supabase = createClient(supabaseURL, supabaseKey);

module.exports = supabase;