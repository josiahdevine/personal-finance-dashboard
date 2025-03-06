@echo off
psql postgresql://neondb_owner:npg_iPQEB3OzW6at@ep-floral-block-a8gbgi8v.eastus2.azure.neon.tech/neondb?sslmode=require -f migrations/20240306_create_investment_tables.sql 