-- Fix remaining search-page affiliate URLs to real product pages
-- Samsung T9 4TB Newegg
UPDATE prices SET affiliate_url = 'https://www.newegg.com/samsung-t9-4tb-usb-3-2-gen-2x2/p/N82E16820147882' WHERE product_id = 29 AND retailer = 'Newegg';

-- SanDisk Extreme Pro 4TB Newegg
UPDATE prices SET affiliate_url = 'https://www.newegg.com/sandisk-extreme-pro-v2-4tb-usb-3-2-gen-2x2-usb-c/p/N82E16820173501' WHERE product_id = 31 AND retailer = 'Newegg';

-- Corsair EX400U 1TB Newegg
UPDATE prices SET affiliate_url = 'https://www.newegg.com/corsair-ex400u-1tb-usb4/p/N82E16820982245' WHERE product_id = 26 AND retailer = 'Newegg';

-- Sabrent Rocket Nano V2 1TB B&H Photo (search as fallback - B&H may not stock this)
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/search?q=sabrent+rocket+nano+v2+sb-1tb-nav2&sts=ma' WHERE product_id = 27 AND retailer = 'B&H Photo';

-- Sabrent Rocket Nano XTRM-Q 1TB B&H Photo (search as fallback)
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/search?q=sabrent+rocket+xtrm+q+sb-xtmq-1tb&sts=ma' WHERE product_id = 25 AND retailer = 'B&H Photo';
