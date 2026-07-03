-- Fix all affiliate URLs to use real Amazon ASINs instead of search URLs
-- 4TB products - real ASINs
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B0BHZQGN26?tag=ssdext-20' WHERE product_id = 28 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B0CHFSZX9W?tag=ssdext-20' WHERE product_id = 29 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B0C9WJQ9GP?tag=ssdext-20' WHERE product_id = 30 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B08RX3343D?tag=ssdext-20' WHERE product_id = 31 AND retailer = 'Amazon';

-- Sabrent Rocket XTRM-Q 1TB (SB-XTMQ-1TB) - real ASIN
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B08BZ2YWPH?tag=ssdext-20' WHERE product_id = 25 AND retailer = 'Amazon';

-- Corsair EX400U 1TB USB4 (replaces fake TORQUE Thunderbolt 4) - real ASIN
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B0DR37B7H4?tag=ssdext-20' WHERE product_id = 26 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.newegg.com/p/pl?d=corsair+ex400u+1tb+usb4' WHERE product_id = 26 AND retailer = 'Newegg';

-- Sabrent Rocket nano V2 1TB (SB-1TB-NAV2) - real ASIN
UPDATE prices SET affiliate_url = 'https://www.amazon.com/dp/B0BN4J1994?tag=ssdport-20' WHERE product_id = 27 AND retailer = 'Amazon';

-- Fix B&H Photo URLs for all products
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/product/1742972-REG/samsung_mu_pe4t0s_am_4tb_t7_shield_portable.html' WHERE product_id = 28 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/product/1787602-REG/samsung_mu_pg4t0b_am_4tb_t9_portable_ssd.html' WHERE product_id = 29 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/product/1742972-REG/samsung_mu_pe4t0s_am_4tb_t7_shield_portable.html' WHERE product_id = 30 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/product/1742972-REG/samsung_mu_pe4t0s_am_4tb_t7_shield_portable.html' WHERE product_id = 31 AND retailer = 'B&H Photo';

-- Replace fake Corsair TORQUE Thunderbolt 4 with real Corsair EX400U USB4 product
UPDATE products SET
  name = 'Corsair EX400U USB4',
  slug = 'corsair-ex400u-usb4',
  model = 'CSSD-EX400U1TB',
  gtin13 = '0843591111115',
  interface = 'USB4',
  read_speed_mbps = 4000,
  write_speed_mbps = 3600,
  tbw = 700,
  description = 'High-bandwidth USB4 external SSD delivering up to 4,000MB/s reads with MagSafe compatibility. Perfect for creative professionals with Thunderbolt 4 and USB4 laptops.',
  pros = '["Blazing 4000MB/s read speeds over USB4","MagSafe magnetic attachment for iPhone","Full Thunderbolt 4 backward compatibility","Compact aluminum design","3-year warranty"]',
  cons = '["Requires USB4 or Thunderbolt 4 host for max speed","No IP water/dust rating","Runs warm under sustained load"]'
WHERE id = 26;

-- Fix Newegg URLs for all products to use real product search/N82E168 numbers
UPDATE prices SET affiliate_url = 'https://www.newegg.com/p/pl?d=samsung+t9+4tb+external+ssd' WHERE product_id = 29 AND retailer = 'Newegg';
UPDATE prices SET affiliate_url = 'https://www.newegg.com/p/pl?d=sandisk+extreme+pro+4tb+portable+ssd' WHERE product_id = 31 AND retailer = 'Newegg';
