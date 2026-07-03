-- Fix 4TB product affiliate URLs (use search as fallback since we don't know real ASINs)
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=Samsung+T7+Shield+4TB+external+SSD&tag=ssdext-20' WHERE product_id = 28 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=Crucial+X10+Pro+4TB+external+SSD&tag=ssdext-20' WHERE product_id = 30 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=Samsung+T9+4TB+external+SSD&tag=ssdext-20' WHERE product_id = 29 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=SanDisk+Extreme+Pro+4TB+external+SSD&tag=ssdext-20' WHERE product_id = 31 AND retailer = 'Amazon';

-- Fix USB4/Thunderbolt placeholder products
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=Sabrent+Rocket+Nano+XTRM+Q&tag=ssdext-20' WHERE product_id = 25 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=Corsair+TORQUE+Thunderbolt+4+SSD&tag=ssdext-20' WHERE product_id = 26 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.amazon.com/s?k=Sabrent+Rocket+Nano+V2&tag=ssdport-20' WHERE product_id = 27 AND retailer = 'Amazon';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/search?q=sabrent+rocket+nano+xtrm+q&sts=ma' WHERE product_id = 25 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/search?q=samsung+t7+shield+4tb&sts=ma' WHERE product_id = 28 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/search?q=crucial+x10+pro+4tb&sts=ma' WHERE product_id = 30 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/search?q=sabrent+rocket+nano+v2&sts=ma' WHERE product_id = 27 AND retailer = 'B&H Photo';
UPDATE prices SET affiliate_url = 'https://www.newegg.com/p/pl?d=samsung+t9+4tb+external+ssd' WHERE product_id = 29 AND retailer = 'Newegg';
UPDATE prices SET affiliate_url = 'https://www.newegg.com/p/pl?d=sandisk+extreme+pro+4tb' WHERE product_id = 31 AND retailer = 'Newegg';
UPDATE prices SET affiliate_url = 'https://www.newegg.com/p/pl?d=corsair+torque+thunderbolt+4' WHERE product_id = 26 AND retailer = 'Newegg';
