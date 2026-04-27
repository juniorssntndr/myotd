SELECT p.id, p.name, b.name as brand_name 
FROM "Product" p 
JOIN "Brand" b ON p."brandId" = b.id 
ORDER BY p."updatedAt" DESC 
LIMIT 5;
