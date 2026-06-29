-- Seed data for SSD Affiliate Network

-- Sites (multi-tenant)
INSERT INTO sites (id, domain, name, tagline, primary_color) VALUES
  ('externalssds', 'externalssds.com', 'External SSDs', 'Find the Best External Solid State Drives – Expert Reviews & Price Comparisons', '#0c8ee7'),
  ('portablessds', 'portablessds.com', 'Portable SSDs', 'Compare the Best Portable Solid State Drives – Speed, Reliability & Value', '#10b981');

-- Categories
INSERT INTO categories (site_id, slug, name, description, display_order) VALUES
  ('externalssds', 'usb-c', 'USB-C External SSDs', 'High-speed USB-C external SSDs for modern laptops and desktops', 1),
  ('externalssds', 'thunderbolt', 'Thunderbolt External SSDs', 'Ultra-fast Thunderbolt 3/4 external SSDs for professionals', 2),
  ('externalssds', 'gaming', 'Gaming External SSDs', 'External SSDs optimized for gaming on console and PC', 3),
  ('portablessds', 'ultra-portable', 'Ultra-Portable SSDs', 'Compact, lightweight SSDs for maximum portability', 1),
  ('portablessds', 'high-speed', 'High-Speed Portable SSDs', 'Performance portable SSDs with >2000 MB/s speeds', 2),
  ('portablessds', 'rugged', 'Rugged Portable SSDs', 'Durable, water/dust/shock-resistant portable SSDs', 3);

-- Brands
INSERT INTO brands (name, slug, description) VALUES
  ('Samsung', 'samsung', 'Industry leader in NAND flash and SSD technology'),
  ('Crucial', 'crucial', 'Micron brand known for reliable, affordable storage'),
  ('Western Digital', 'wd', 'Trusted name in data storage solutions'),
  ('SanDisk', 'sandisk', 'Pioneer in flash memory technology'),
  ('Seagate', 'seagate', 'Leading data storage infrastructure provider'),
  ('Sabrent', 'sabrent', 'High-performance storage solutions for enthusiasts'),
  ('SK hynix', 'sk-hynix', 'Major NAND flash and DRAM manufacturer'),
  ('Kingston', 'kingston', 'World''s largest independent memory manufacturer'),
  ('Corsair', 'corsair', 'Premium components for gamers and creators'),
  ('ADATA', 'adata', 'Taiwanese memory and storage manufacturer');

-- Products for externalssds.com
INSERT INTO products (site_id, category_id, brand_id, name, slug, model, capacity_gb, form_factor, interface, read_speed_mbps, write_speed_mbps, tbw, warranty_years, description, overall_score, is_featured) VALUES
  ('externalssds', 1, 1, 'Samsung T7 Shield', 'samsung-t7-shield', 'MU-PE1T0S', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 580, 3, 'Rugged, pocket-sized external SSD with IP65 water/dust resistance. Ideal for creative professionals on the go.', 9.2, 1),
  ('externalssds', 1, 1, 'Samsung T9 Portable SSD', 'samsung-t9', 'MU-PG1T0B', 1024, 'External', 'USB 3.2 Gen 2x2', 2000, 1950, 600, 5, 'Blazing-fast Gen 2x2 speeds in a compact, stylish design. Perfect for content creators working with large files.', 9.5, 1),
  ('externalssds', 2, 2, 'Crucial X10 Pro', 'crucial-x10-pro', 'CT2000X10PRO9', 2048, 'External', 'USB 3.2 Gen 2x2', 2100, 2000, 1200, 5, 'Professional-grade portable SSD with speeds up to 2100MB/s. Mac and PC compatible.', 9.0, 0),
  ('externalssds', 1, 3, 'WD My Passport SSD', 'wd-my-passport-ssd', 'WDBAGF0010BGY', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 500, 3, 'Sleek, stylish external SSD with hardware encryption and drop resistance up to 6.5 feet.', 8.5, 0),
  ('externalssds', 3, 9, 'Corsair EX100U', 'corsair-ex100u', 'CSSD-EX100U-2000', 2048, 'External', 'USB 3.2 Gen 2x2', 1600, 1500, 900, 3, 'High-performance external SSD with USB-C connectivity, ideal for gaming and content creation.', 8.2, 0),
  ('externalssds', 2, 5, 'Seagate FireCuda External USB-C', 'seagate-firecuda-external', 'STJP2000400', 2048, 'External', 'USB 3.2 Gen 2', 1030, 1030, 700, 3, 'Purpose-built for gamers with RGB lighting and fast load times for console and PC.', 8.8, 0);

-- Products for portablessds.com
INSERT INTO products (site_id, category_id, brand_id, name, slug, model, capacity_gb, form_factor, interface, read_speed_mbps, write_speed_mbps, tbw, warranty_years, description, overall_score, is_featured) VALUES
  ('portablessds', 4, 1, 'Samsung T7 Portable SSD', 'samsung-t7-portable', 'MU-PC1T0K', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 580, 3, 'Ultra-slim, pocket-sized portable SSD with AES 256-bit encryption. The go-to choice for everyday portability.', 9.3, 1),
  ('portablessds', 5, 1, 'Samsung T9 Portable SSD', 'samsung-t9-portable', 'MU-PG1T0B', 1024, 'External', 'USB 3.2 Gen 2x2', 2000, 1950, 600, 5, 'The fastest Samsung portable SSD with USB 3.2 Gen 2x2 interface. Up to 2GB/s sequential reads.', 9.6, 1),
  ('portablessds', 6, 1, 'Samsung T7 Shield', 'samsung-t7-shield-portable', 'MU-PE1T0S', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 580, 3, 'IP65-rated rugged portable SSD. Drop-proof up to 3 meters. Perfect for outdoor photography and field work.', 9.1, 0),
  ('portablessds', 5, 4, 'SanDisk Extreme Pro Portable SSD', 'sandisk-extreme-pro-portable', 'SDSSDE81-1T00', 1024, 'External', 'USB 3.2 Gen 2x2', 2000, 2000, 600, 5, 'Extreme speeds in a rugged, compact drive. IP55 water/dust resistance with a carabiner loop.', 9.4, 1),
  ('portablessds', 6, 4, 'SanDisk Extreme Portable SSD', 'sandisk-extreme-portable', 'SDSSDE61-1T00', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 500, 3, 'Rugged, reliable portable storage with IP55 rating. Built for adventure with a convenient loop design.', 8.7, 0),
  ('portablessds', 4, 2, 'Crucial X9 Pro', 'crucial-x9-pro', 'CT1000X9PRO9', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 440, 3, 'Ultra-compact pro-grade portable SSD. Pocket-sized at just 65g. Ideal for mobile professionals.', 8.9, 0);

-- Prices
INSERT INTO prices (product_id, retailer, price_cents, currency, affiliate_url, in_stock) VALUES
  (1, 'Amazon', 10999, 'USD', 'https://www.amazon.com/dp/B0873X1X1S?tag=ssdaffiliates-20', 1),
  (1, 'B&H Photo', 11299, 'USD', 'https://www.bhphotovideo.com/c/product/1582280-REG', 1),
  (1, 'Newegg', 10899, 'USD', 'https://www.newegg.com/p/1ZK-003F-00018', 1),
  (2, 'Amazon', 17999, 'USD', 'https://www.amazon.com/dp/B0CN8G8W9W?tag=ssdaffiliates-20', 1),
  (2, 'B&H Photo', 18499, 'USD', 'https://www.bhphotovideo.com/c/product/1768393-REG', 1),
  (3, 'Amazon', 14999, 'USD', 'https://www.amazon.com/dp/B0CHX7Y6Z8?tag=ssdaffiliates-20', 1),
  (3, 'Newegg', 14699, 'USD', 'https://www.newegg.com/p/1ZK-003F-00028', 1),
  (4, 'Amazon', 9499, 'USD', 'https://www.amazon.com/dp/B08VL8T2S4?tag=ssdaffiliates-20', 1),
  (4, 'B&H Photo', 9699, 'USD', 'https://www.bhphotovideo.com/c/product/1582280-REG', 1),
  (5, 'Amazon', 15999, 'USD', 'https://www.amazon.com/dp/B0C1Y1Y2Y3?tag=ssdaffiliates-20', 1),
  (6, 'Amazon', 17999, 'USD', 'https://www.amazon.com/dp/B0897Z1Q2R?tag=ssdaffiliates-20', 1),
  (7, 'Amazon', 9999, 'USD', 'https://www.amazon.com/dp/B0873X1X1S?tag=ssdaffiliates-20', 1),
  (7, 'B&H Photo', 10299, 'USD', 'https://www.bhphotovideo.com/c/product/1582280-REG', 1),
  (8, 'Amazon', 17999, 'USD', 'https://www.amazon.com/dp/B0CN8G8W9W?tag=ssdaffiliates-20', 1),
  (8, 'Newegg', 17699, 'USD', 'https://www.newegg.com/p/1ZK-003F-00018', 1),
  (9, 'Amazon', 10999, 'USD', 'https://www.amazon.com/dp/B0873X1X1S?tag=ssdaffiliates-20', 1),
  (10, 'Amazon', 16999, 'USD', 'https://www.amazon.com/dp/B08VL8T2S4?tag=ssdaffiliates-20', 1),
  (10, 'B&H Photo', 17499, 'USD', 'https://www.bhphotovideo.com/c/product/1582280-REG', 1),
  (10, 'Newegg', 16699, 'USD', 'https://www.newegg.com/p/1ZK-003F-00028', 1),
  (11, 'Amazon', 9999, 'USD', 'https://www.amazon.com/dp/B0873X1X1S?tag=ssdaffiliates-20', 1),
  (12, 'Amazon', 8999, 'USD', 'https://www.amazon.com/dp/B0CHX7Y6Z8?tag=ssdaffiliates-20', 1);

-- Affiliate configs (geo-targeted)
INSERT INTO affiliate_configs (site_id, retailer, country_code, affiliate_tag) VALUES
  ('externalssds', 'Amazon', 'US', 'ssdext-20'),
  ('externalssds', 'Amazon', 'GB', 'ssdext-21'),
  ('externalssds', 'Amazon', 'DE', 'ssdext-22'),
  ('externalssds', 'Amazon', 'CA', 'ssdext-23'),
  ('externalssds', 'Amazon', '*', 'ssdext-20'),
  ('portablessds', 'Amazon', 'US', 'ssdport-20'),
  ('portablessds', 'Amazon', 'GB', 'ssdport-21'),
  ('portablessds', 'Amazon', 'DE', 'ssdport-22'),
  ('portablessds', 'Amazon', 'CA', 'ssdport-23'),
  ('portablessds', 'Amazon', '*', 'ssdport-20');
