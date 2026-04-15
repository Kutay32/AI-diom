-- 004_seed_idioms.sql
-- Temel 20 deyimi veritabanina ekler ("meaning" sutunu schema'da olmadigi icin cikarildi).

INSERT INTO idioms (text, emojis) VALUES
('etekleri tutuşmak', '["👗", "🔥", "🏃"]'::jsonb),
('göz kulak olmak', '["👀", "👂", "🛡️"]'::jsonb),
('ateş püskürmek', '["🔥", "😡", "😤"]'::jsonb),
('aklı başına gelmek', '["🧠", "💡", "🤯"]'::jsonb),
('ağzı kulaklarına varmak', '["😁", "👂", "🎉"]'::jsonb),
('baş tacı etmek', '["👑", "🙇‍♂️", "💖"]'::jsonb),
('yolun başında olmak', '["🛣️", "🚶‍♂️", "🌅"]'::jsonb),
('eli ayağına dolaşmak', '["✋", "🦶", "🌀"]'::jsonb),
('çamur atmak', '["💩", "🗣️", "❌"]'::jsonb),
('göze girmek', '["👀", "➡️", "🌟"]'::jsonb),
('havalara uçmak', '["🎈", "✈️", "☁️"]'::jsonb),
('kepenk indirmek', '["🏬", "🚪", "🔒"]'::jsonb),
('kulak asmamak', '["👂", "🚫", "🤷"]'::jsonb),
('pot kırmak', '["☕", "🔨", "🤦‍♂️"]'::jsonb),
('sabrı taşmak', '["⏳", "🌋", "💥"]'::jsonb),
('suya düşmek', '["💧", "📉", "😞"]'::jsonb),
('yakayı ele vermek', '["👔", "👮", "🚔"]'::jsonb),
('yıldızı parlamak', '["⭐", "✨", "🤩"]'::jsonb),
('zıvanadan çıkmak', '["🤬", "💢", "🚪"]'::jsonb),
('küplere binmek', '["🧊", "😡", "🐎"]'::jsonb)
ON CONFLICT (text) DO NOTHING;
