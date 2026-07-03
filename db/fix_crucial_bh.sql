-- Fix Crucial X10 Pro 4TB B&H Photo URL (was incorrectly pointing to Samsung T7 Shield)
UPDATE prices SET affiliate_url = 'https://www.bhphotovideo.com/c/product/1776927-REG/crucial_ct4000x10prossd9_4tb_x10_pro_usb.html' WHERE product_id = 30 AND retailer = 'B&H Photo';
