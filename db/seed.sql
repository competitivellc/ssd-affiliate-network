-- Seed data for SSD Affiliate Network

-- Sites (multi-tenant)
INSERT OR IGNORE INTO sites (id, domain, name, tagline, primary_color) VALUES
  ('externalssds', 'externalssds.com', 'External SSDs', 'Find the Best External Solid State Drives - Expert Reviews & Price Comparisons', '#0c8ee7'),
  ('portablessds', 'portablessds.com', 'Portable SSDs', 'Compare the Best Portable Solid State Drives - Speed, Reliability & Value', '#10b981');

-- Categories
INSERT OR IGNORE INTO categories (site_id, slug, name, description, display_order) VALUES
  ('externalssds', 'usb-c', 'USB-C External SSDs', 'High-speed USB-C external SSDs for modern laptops and desktops', 1),
  ('externalssds', 'thunderbolt', 'Thunderbolt External SSDs', 'Ultra-fast Thunderbolt 3/4 external SSDs for professionals', 2),
  ('externalssds', 'gaming', 'Gaming External SSDs', 'External SSDs optimized for gaming on console and PC', 3),
  ('portablessds', 'ultra-portable', 'Ultra-Portable SSDs', 'Compact, lightweight SSDs for maximum portability', 1),
  ('portablessds', 'high-speed', 'High-Speed Portable SSDs', 'Performance portable SSDs with >2000 MB/s speeds', 2),
  ('portablessds', 'rugged', 'Rugged Portable SSDs', 'Durable, water/dust/shock-resistant portable SSDs', 3);

-- Brands
INSERT OR IGNORE INTO brands (name, slug, description) VALUES
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
INSERT OR IGNORE INTO products (site_id, category_id, brand_id, name, slug, model, capacity_gb, form_factor, interface, read_speed_mbps, write_speed_mbps, tbw, warranty_years, description, overall_score, is_featured, pros, cons) VALUES
  ('externalssds', 1, 1, 'Samsung T7 Shield', 'samsung-t7-shield', 'MU-PE1T0S', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 580, 3, 'Rugged, pocket-sized external SSD with IP65 water/dust resistance. Ideal for creative professionals on the go.', 9.2, 1, '["IP65 water and dust resistant","Drop-proof up to 3 meters","Compact and lightweight design","AES 256-bit hardware encryption","Dynamic Thermal Guard for heat control"]', '["Limited to 1050MB/s (no Gen 2x2)","Rubber exterior collects lint","No hardware encryption toggle in software"]'),
  ('externalssds', 1, 1, 'Samsung T9 Portable SSD', 'samsung-t9', 'MU-PG1T0B', 1024, 'External', 'USB 3.2 Gen 2x2', 2000, 1950, 600, 5, 'Blazing-fast Gen 2x2 speeds in a compact, stylish design. Perfect for content creators working with large files.', 9.5, 1, '["Blazing 2000MB/s read speeds","USB 3.2 Gen 2x2 support","Sleek all-aluminum build","5-year warranty","Samsung Magician software support"]', '["Requires Gen 2x2 host for full speed","No IP rating","Rubberized surface can show wear"]'),
  ('externalssds', 1, 2, 'Crucial X10 Pro', 'crucial-x10-pro', 'CT2000X10PRO9', 2048, 'External', 'USB 3.2 Gen 2x2', 2100, 2000, 1200, 5, 'Professional-grade portable SSD with speeds up to 2100MB/s. Mac and PC compatible.', 9.0, 0, '["Fastest USB 3.2 Gen 2x2 speeds","IP55 water and dust resistance","Excellent 1200 TBW endurance","Compact form factor","USB-C to C and C to A cables included"]', '["No hardware encryption","Runs warm under sustained load","Software could be more polished"]'),
  ('externalssds', 1, 3, 'WD My Passport SSD', 'wd-my-passport-ssd', 'WDBAGF0010BGY', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 500, 3, 'Sleek, stylish external SSD with hardware encryption and drop resistance up to 6.5 feet.', 8.5, 0, '["Sleek metal design","AES 256-bit hardware encryption","Drop resistant up to 6.5 feet","USB-C with USB-A adapter included","WD Discovery backup software"]', '["Only 3-year warranty","No IP rating","Limited to 1050MB/s speeds"]'),
  ('externalssds', 3, 9, 'Corsair EX100U', 'corsair-ex100u', 'CSSD-EX100U-2000', 2048, 'External', 'USB 3.2 Gen 2x2', 1600, 1500, 900, 3, 'High-performance external SSD with USB-C connectivity, ideal for gaming and content creation.', 8.2, 0, '["Good 1600MB/s read speeds","USB 3.2 Gen 2x2 interface","Attractive design","Competitive pricing"]', '["Slower than competing Gen 2x2 drives","Only 3-year warranty","No IP rating","Limited software support"]'),
  ('externalssds', 3, 5, 'Seagate FireCuda External USB-C', 'seagate-firecuda-external', 'STJP2000400', 2048, 'External', 'USB 3.2 Gen 2', 1030, 1030, 700, 3, 'Purpose-built for gamers with RGB lighting and fast load times for console and PC.', 8.8, 1, '["RGB lighting customizable via software","Fast load times for console and PC","USB-C connectivity","Seagate Rescue data recovery included","3-year warranty with data recovery"]', '["Limited to 1030MB/s (no Gen 2x2)","RGB requires software on PC","Not IP rated"]');

-- Products for portablessds.com
INSERT OR IGNORE INTO products (site_id, category_id, brand_id, name, slug, model, capacity_gb, form_factor, interface, read_speed_mbps, write_speed_mbps, tbw, warranty_years, description, overall_score, is_featured, pros, cons) VALUES
  ('portablessds', 4, 1, 'Samsung T7 Portable SSD', 'samsung-t7-portable', 'MU-PC1T0K', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 580, 3, 'Ultra-slim, pocket-sized portable SSD with AES 256-bit encryption. The go-to choice for everyday portability.', 9.3, 1, '["Ultra-slim and lightweight","AES 256-bit hardware encryption","Solid aluminum unibody design","Good 1050MB/s read speeds","Thermal management keeps it cool"]', '["No IP rating","Limited to USB 3.2 Gen 2","No DRAM cache"]'),
  ('portablessds', 5, 1, 'Samsung T9 Portable SSD', 'samsung-t9-portable', 'MU-PG1T0B', 1024, 'External', 'USB 3.2 Gen 2x2', 2000, 1950, 600, 5, 'The fastest Samsung portable SSD with USB 3.2 Gen 2x2 interface. Up to 2GB/s sequential reads.', 9.6, 1, '["Fastest Samsung portable SSD","USB 3.2 Gen 2x2 support","5-year warranty","Excellent build quality","Magician software support"]', '["Requires Gen 2x2 host for max speed","Premium pricing","No IP rating"]'),
  ('portablessds', 6, 1, 'Samsung T7 Shield', 'samsung-t7-shield-portable', 'MU-PE1T0S', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 580, 3, 'IP65-rated rugged portable SSD. Drop-proof up to 3 meters. Perfect for outdoor photography and field work.', 9.1, 0, '["IP65 dust and water resistance","Drop-proof up to 3 meters","Compact despite rugged build","AES 256-bit encryption","Strong thermal performance"]', '["Limited to 1050MB/s speeds","Rubber coating collects dust","Premium over non-shielded T7"]'),
  ('portablessds', 5, 4, 'SanDisk Extreme Pro Portable SSD', 'sandisk-extreme-pro-portable', 'SDSSDE81-1T00', 1024, 'External', 'USB 3.2 Gen 2x2', 2000, 2000, 600, 5, 'Extreme speeds in a rugged, compact drive. IP55 water/dust resistance with a carabiner loop.', 9.4, 1, '["Excellent 2000MB/s read and write","IP55 water and dust resistance","5-year warranty","Carabiner loop for easy carrying","Works with iPhone 15 Pro"]', '["Known firmware issues in early models","Not compatible with iPhone 15 Pro ProRes","Runs warm under sustained load"]'),
  ('portablessds', 6, 4, 'SanDisk Extreme Portable SSD', 'sandisk-extreme-portable', 'SDSSDE61-1T00', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 500, 3, 'Rugged, reliable portable storage with IP55 rating. Built for adventure with a convenient loop design.', 8.7, 0, '["IP55 water and dust resistance","Drop-proof up to 3 meters","Compact and lightweight","Carabiner loop included","AES 256-bit encryption"]', '["Limited to 1050MB/s speeds","3-year warranty","Software can be buggy"]'),
  ('portablessds', 4, 2, 'Crucial X9 Pro', 'crucial-x9-pro', 'CT1000X9PRO9', 1024, 'External', 'USB 3.2 Gen 2', 1050, 1000, 440, 3, 'Ultra-compact pro-grade portable SSD. Pocket-sized at just 65g. Ideal for mobile professionals.', 8.9, 0, '["Extremely compact and lightweight (65g)","IP55 water and dust resistance","Drop-proof up to 2 meters","USB-C to C and C to A cables included","Good value for money"]', '["Limited to 1050MB/s speeds","440 TBW is lower than competitors","Only 3-year warranty"]');

-- Prices
INSERT OR IGNORE INTO prices (product_id, retailer, price_cents, currency, affiliate_url, in_stock) VALUES
   (1, 'Amazon', 10999, 'USD', 'https://www.amazon.com/dp/B09VLK9W3S?tag=ssdaffiliates-20', 1),
   (1, 'B&H Photo', 11299, 'USD', 'https://www.bhphotovideo.com/c/product/1691588-REG', 1),
   (1, 'Newegg', 10899, 'USD', 'https://www.newegg.com/samsung-t7-shield-1tb-usb-3-2-gen-2/p/N82E16820147837', 1),
   (2, 'Amazon', 17999, 'USD', 'https://www.amazon.com/dp/B0CHFSWM2P?tag=ssdaffiliates-20', 1),
  (2, 'B&H Photo', 18499, 'USD', 'https://www.bhphotovideo.com/c/product/1768393-REG', 1),
   (3, 'Amazon', 14999, 'USD', 'https://www.amazon.com/dp/B0C9WGS6MC?tag=ssdaffiliates-20', 1),
   (3, 'Newegg', 14699, 'USD', 'https://www.newegg.com/crucial-x10-pro-ct2000x10prossd9-2tb-usb-3-2-gen-2x2-portable-ssd/p/N82E16820156378', 1),
   (4, 'Amazon', 9499, 'USD', 'https://www.amazon.com/dp/B08F27QGHX?tag=ssdaffiliates-20', 1),
   (4, 'B&H Photo', 9699, 'USD', 'https://www.bhphotovideo.com/c/product/1611561-REG', 1),
   (5, 'Amazon', 15999, 'USD', 'https://www.amazon.com/dp/B0BGJ1JF8L?tag=ssdaffiliates-20', 1),
   (6, 'Amazon', 17999, 'USD', 'https://www.amazon.com/dp/B0C3FCHLSL?tag=ssdaffiliates-20', 1),
   (7, 'Amazon', 9999, 'USD', 'https://www.amazon.com/dp/B0874XN4D8?tag=ssdaffiliates-20', 1),
   (7, 'B&H Photo', 10299, 'USD', 'https://www.bhphotovideo.com/c/product/1559836-REG', 1),
   (8, 'Amazon', 17999, 'USD', 'https://www.amazon.com/dp/B0CHFSWM2P?tag=ssdaffiliates-20', 1),
   (8, 'Newegg', 17699, 'USD', 'https://www.newegg.com/samsung-t9-1tb-usb-3-2-gen-2x2/p/N82E16820147880', 1),
   (9, 'Amazon', 10999, 'USD', 'https://www.amazon.com/dp/B09VLK9W3S?tag=ssdaffiliates-20', 1),
   (10, 'Amazon', 16999, 'USD', 'https://www.amazon.com/dp/B08GV9M64L?tag=ssdaffiliates-20', 1),
   (10, 'B&H Photo', 17499, 'USD', 'https://www.bhphotovideo.com/c/product/1595434-REG', 1),
   (10, 'Newegg', 16699, 'USD', 'https://www.newegg.com/p/3C6-007M-001T0', 1),
   (11, 'Amazon', 9999, 'USD', 'https://www.amazon.com/dp/B08GTYFC37?tag=ssdaffiliates-20', 1),
   (12, 'Amazon', 8999, 'USD', 'https://www.amazon.com/dp/B0C9WKGXHD?tag=ssdaffiliates-20', 1);

-- Hubs (programmatic taxonomy pages)
INSERT OR IGNORE INTO hubs (site_id, hub_type, slug, name, description, meta_description, h1, intro_html, filter_criteria, display_order) VALUES
  -- externalssds.com: Use-Case Hubs
  ('externalssds', 'use-case', 'best-ssd-for-ps5', 'Best External SSD for PS5', 'Top-rated external SSDs optimized for PlayStation 5 storage expansion. Compare speeds, capacities, and console compatibility.', 'Find the best external SSD for PS5 - compare speeds, capacities, and console compatibility.', 'Best External SSD for PS5', '<p>Expanding your PlayStation 5 storage requires an external SSD that meets Sony''s speed baselines and offers seamless game play. These drives deliver the read/write performance needed for fast loading, smooth asset streaming, and quick game transfers - all via USB connection.</p>', '{"category_slug":["gaming"],"keywords":["ps5","playstation","console","gaming"],"min_read_speed":900,"sort":"overall_score DESC","limit":6}', 1),
  ('externalssds', 'use-case', 'best-ssd-for-mac', 'Best External SSD for Mac', 'External SSDs optimized for macOS - Time Machine backups, APFS compatibility, and Thunderbolt/USB-C performance.', 'Find the best external SSD for Mac - Time Machine ready, APFS compatible, fast Thunderbolt and USB-C options.', 'Best External SSD for Mac', '<p>Mac users need external SSDs that play nicely with APFS, deliver strong sequential performance over Thunderbolt or USB-C, and work reliably with Time Machine. These drives are tested for macOS compatibility.</p>', '{"category_slug":["usb-c","thunderbolt"],"keywords":["mac","macbook","time machine","apfs","creative"],"sort":"overall_score DESC","limit":6}', 2),
  ('externalssds', 'use-case', 'best-ssd-for-xbox', 'Best External SSD for Xbox', 'External SSDs built for Xbox Series X|S and Xbox One - fast game loads, quick resume support, and ample capacity.', 'Find the best external SSD for Xbox - fast game loads, large capacity, and console-optimized performance.', 'Best External SSD for Xbox', '<p>Xbox gamers need external SSDs that deliver fast transfer speeds for seamless game play on Xbox Series X|S and Xbox One. These drives provide the capacity and speed to keep your game library ready to play.</p>', '{"category_slug":["gaming"],"keywords":["xbox","console","gaming","game"],"sort":"overall_score DESC","limit":6}', 3),
  -- externalssds.com: Performance Hubs
  ('externalssds', 'performance', 'fastest-usb4-external-ssd', 'Fastest USB4 External Drives', 'The fastest USB4 external SSDs ranked by read/write speed. Compare 40Gbps interface performance and real-world throughput.', 'Compare the fastest USB4 external drives ranked by speed - 40Gbps interface performance benchmarks.', 'Fastest USB4 External Drives', '<p>USB4 delivers up to 40 Gbps of bandwidth, rivaling Thunderbolt 4 for external storage. These drives push the limits of what''s possible over a single USB-C cable, delivering extreme throughput for professional workflows.</p>', '{"interface":["USB4","Thunderbolt 3","Thunderbolt 4"],"sort":"read_speed_mbps DESC","limit":6}', 4),
  ('externalssds', 'performance', 'fastest-thunderbolt-external-ssd', 'Fastest Thunderbolt External SSDs', 'Top Thunderbolt 3 and Thunderbolt 4 external SSDs ranked by speed. Professional-grade performance for creative workflows.', 'Compare the fastest Thunderbolt external SSDs - Thunderbolt 3/4 drives ranked by speed and performance.', 'Fastest Thunderbolt External SSDs', '<p>Thunderbolt 3 and Thunderbolt 4 offer 40 Gbps dedicated bandwidth - ideal for video editors and creative professionals who need to edit 4K/8K footage directly from external storage. These are the fastest Thunderbolt SSDs available.</p>', '{"interface":["Thunderbolt 3","Thunderbolt 4"],"sort":"read_speed_mbps DESC","limit":6}', 5),
  ('externalssds', 'performance', 'fastest-usb-3-2-gen-2x2', 'Fastest USB 3.2 Gen 2x2 External SSDs', 'USB 3.2 Gen 2x2 external SSDs ranked by speed - 20Gbps interface performance for prosumers and creators.', 'Find the fastest USB 3.2 Gen 2x2 external SSDs - 20Gbps drives ranked by read/write speed.', 'Fastest USB 3.2 Gen 2x2 SSDs', '<p>USB 3.2 Gen 2x2 doubles standard USB-C bandwidth to 20 Gbps. These drives offer Thunderbolt-like speeds at a more accessible price point, making them ideal for content creators and power users.</p>', '{"interface":["USB 3.2 Gen 2x2"],"sort":"read_speed_mbps DESC","limit":6}', 6),
  -- externalssds.com: Value Hubs
  ('externalssds', 'value', 'cheapest-2tb-external-ssd', 'Cheapest 2TB External SSDs', 'The most affordable 2TB external SSDs ranked by price. Compare cost-per-gigabyte and find the best value.', 'Compare the cheapest 2TB external SSDs - best value drives ranked by price and cost-per-gigabyte.', 'Cheapest 2TB External SSDs', '<p>2TB is the sweet spot for external SSD capacity - enough for large game libraries, video projects, or backups without breaking the bank. These are the most affordable 2TB drives on the market.</p>', '{"capacity_gb":2000,"sort":"price_cents ASC","limit":6}', 7),
  ('externalssds', 'value', 'cheapest-1tb-external-ssd', 'Cheapest 1TB External SSDs', 'Budget-friendly 1TB external SSDs ranked by price. Find the best value 1TB portable storage.', 'Compare the cheapest 1TB external SSDs - budget-friendly portable storage ranked by price.', 'Cheapest 1TB External SSDs', '<p>1TB external SSDs offer the best balance of affordability and capacity for everyday use. These are the most affordable 1TB drives, perfect for expanding your laptop storage or keeping backups.</p>', '{"capacity_gb":1000,"sort":"price_cents ASC","limit":6}', 8),
  ('externalssds', 'value', 'best-value-4tb-external-ssd', 'Best Value 4TB External SSDs', 'High-capacity 4TB external SSDs with the lowest cost per gigabyte. Max storage for minimal spend.', 'Compare the best value 4TB external SSDs - lowest cost-per-gigabyte for maximum storage.', 'Best Value 4TB External SSDs', '<p>For users who need maximum capacity, 4TB external SSDs deliver the lowest cost per gigabyte. These drives pack the most storage for your dollar - ideal for media archives and large game libraries.</p>', '{"capacity_gb":4000,"sort":"price_cents ASC","limit":6}', 9),
  -- portablessds.com: Use-Case Hubs
  ('portablessds', 'use-case', 'best-portable-ssd-for-console-gaming', 'Best Portable SSD for Console Gaming', 'Portable SSDs optimized for PlayStation 5 and Xbox Series X|S gaming - fast load times and easy portability.', 'Find the best portable SSD for console gaming - fast, compact drives for PS5 and Xbox.', 'Best Portable SSD for Console Gaming', '<p>Take your game library on the go with a portable SSD built for console gaming. These compact drives deliver fast load times and easy plug-and-play compatibility with PS5 and Xbox Series X|S.</p>', '{"category_slug":["ultra-portable","high-speed"],"keywords":["gaming","console","ps5","xbox","game"],"sort":"overall_score DESC","limit":6}', 1),
  ('portablessds', 'use-case', 'best-rugged-portable-ssd-for-travel', 'Best Rugged Portable SSD for Travel', 'Durable, weather-resistant portable SSDs built for travel and outdoor use. IP-rated, drop-proof, and adventure-ready.', 'Find the best rugged portable SSD for travel - durable, waterproof, and drop-proof drives.', 'Best Rugged Portable SSD for Travel', '<p>Whether you are a photographer shooting in the field or a traveler backing up memories on the go, a rugged portable SSD keeps your data safe from drops, dust, and water. These drives are built for adventure.</p>', '{"category_slug":["rugged"],"keywords":["shield","extreme","rugged","tough","ip65","ip55"],"sort":"overall_score DESC","limit":6}', 2),
  -- portablessds.com: Performance Hubs
  ('portablessds', 'performance', 'fastest-usb-c-portable-ssd', 'Fastest USB-C Portable SSDs', 'The fastest USB-C portable SSDs ranked by read/write speed. Gen 2x2 and Gen 2 performance leaders.', 'Compare the fastest USB-C portable SSDs - speed-ranked for maximum performance.', 'Fastest USB-C Portable SSDs', '<p>USB-C has become the universal standard for portable storage. These drives deliver the fastest speeds over USB-C, from 10Gbps Gen 2 to 20Gbps Gen 2x2 - ideal for professionals who need speed on the go.</p>', '{"interface":["USB 3.2 Gen 2","USB 3.2 Gen 2x2","USB4"],"sort":"read_speed_mbps DESC","limit":6}', 3),
  -- portablessds.com: Value Hubs
  ('portablessds', 'value', 'cheapest-1tb-portable-ssd', 'Cheapest 1TB Portable SSDs', 'The most affordable 1TB portable SSDs ranked by price. Compact storage at the best value.', 'Compare the cheapest 1TB portable SSDs - best value compact storage ranked by price.', 'Cheapest 1TB Portable SSDs', '<p>1TB is the perfect capacity for a portable SSD - enough space for projects, games, and backups in a pocket-sized package. These are the most affordable 1TB portable drives available.</p>', '{"capacity_gb":1000,"sort":"price_cents ASC","limit":6}', 4),
  ('portablessds', 'value', 'cheapest-2tb-portable-ssd', 'Cheapest 2TB Portable SSDs', 'Budget-friendly 2TB portable SSDs ranked by price. Maximum portable storage at minimum cost.', 'Find the cheapest 2TB portable SSDs - best value high-capacity portable storage.', 'Cheapest 2TB Portable SSDs', '<p>Double your portable storage without doubling your budget. These 2TB portable SSDs deliver the most capacity for your money, perfect for creators and travelers with large media libraries.</p>', '{"capacity_gb":2000,"sort":"price_cents ASC","limit":6}', 5);

-- Affiliate configs (geo-targeted)
INSERT OR IGNORE INTO affiliate_configs (site_id, retailer, country_code, affiliate_tag) VALUES
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
