-- Normalize legacy postings that still referenced USD before the SAR default rollout.
UPDATE "SalePosting" SET "currency" = 'SAR';
