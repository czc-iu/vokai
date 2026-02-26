-- 给所有现有用户初始化10000 tokens
USE `tomybot`;

-- 更新所有token_balance为NULL或0的用户
UPDATE `users` 
SET `token_balance` = 10000 
WHERE `token_balance` IS NULL OR `token_balance` = 0;

-- 查看更新结果
SELECT id, email, name, token_balance FROM `users`;
