-- Story IP Database Seed Data
-- Project: Eternal Rift
-- Purpose: MVP fixture data for React UI, Supabase CRUD, and Prompt Builder validation.
-- UUID rule: 00000000-0000-4000-8000-000000000XXX
--   001~099: projects
--   101~199: worldviews
--   201~299: characters
--   301~399: locations
--   401~499: factions
--   501~599: character_relationships
--   601~699: style_guides
--   701~799: prompt_templates
--   801~899: assets
--
-- Notes:
-- - owner_id is intentionally null for the initial local/personal MVP.
-- - assets are excluded until actual Supabase Storage paths or external URLs exist.
-- - This file is designed to be safely re-runnable via upsert.

begin;

-- =========================================================
-- 1. Project
-- =========================================================

insert into public.projects (
  id,
  owner_id,
  title,
  slug,
  description,
  genre,
  target_platform,
  target_format,
  synopsis,
  visual_style,
  status,
  metadata
)
values (
  '00000000-0000-4000-8000-000000000001',
  null,
  'Eternal Rift',
  'eternal-rift',
  'A science fantasy animation IP about a wormhole, immortal energy, divided civilizations, giant lifeforms, and tragic revenge.',
  'science_fantasy',
  'youtube_shorts',
  '16:9',
  'A parkour and climbing champion and a physicist assistant cross a wormhole into a planet shaped by immortal energy. In a world divided between southern mercenary societies and a northern immortal civilization, their survival journey becomes a tragedy of truth, revenge, and return.',
  'cinematic anime dark fantasy',
  'active',
  '{
    "seed_key": "eternal_rift",
    "source": "user_original_fantasy_novel",
    "mvp_usage": ["react_ui", "prompt_builder", "relationship_validation"]
  }'::jsonb
)
on conflict (slug)
do update set
  title = excluded.title,
  description = excluded.description,
  genre = excluded.genre,
  target_platform = excluded.target_platform,
  target_format = excluded.target_format,
  synopsis = excluded.synopsis,
  visual_style = excluded.visual_style,
  status = excluded.status,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 2. Worldviews
-- =========================================================

insert into public.worldviews (
  id,
  project_id,
  name,
  summary,
  era,
  civilization_level,
  core_rules,
  science_or_magic_rules,
  major_events,
  major_regions,
  forbidden_settings,
  visual_tone,
  prompt_summary,
  metadata
)
values
(
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Immortal Energy Planet',
  'A planet similar to Earth, but transformed by immortal energy, giant lifeforms, climate-control technology, and separated civilizations.',
  'medieval_science_fantasy',
  'divided_civilization',
  'Immortal energy grows stronger toward the northern hemisphere. Lifeforms become larger where the energy concentration is higher. Northern and southern civilizations remain culturally and technologically separated.',
  'Immortal energy originates from special dividing cells discovered by a biologist. Climate-control devices and airflow systems regulate the planet. What humans once believed to be a time machine is actually a wormhole generator.',
  '[
    {"name": "Wormhole Arrival", "description": "Leon and Aria arrive on the planet through the wormhole."},
    {"name": "Northern Expedition", "description": "The merged mercenary group moves north and discovers the truth of immortal energy."},
    {"name": "Kael Death", "description": "Kael dies during the northern advance, triggering Aria''s transformation."}
  ]'::jsonb,
  '["Southern mercenary territories", "Northern immortal civilization", "Frozen climate control facility", "Giant lifeform wilderness"]'::jsonb,
  'The world must not become pure medieval fantasy. Its supernatural elements should remain explainable through biology, physics, energy systems, and lost scientific devices.',
  'cold northern light, vast wilderness, ancient bio-energy ruins, giant skeletal structures, lonely blue-gray atmosphere',
  'A cold science fantasy planet where immortal bio-energy shapes geography, giant creatures, and divided civilizations. The south remains mercenary and medieval, while the north controls advanced immortal energy and climate systems.',
  '{"primary_worldview": true, "energy_system": "immortal_energy", "visual_keywords": ["cold blue light", "giant lifeforms", "bio-energy ruins", "divided civilization"]}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000001',
  'Wormhole Origin Earth',
  'The modern Earth where the original wormhole research began.',
  'near_future',
  'modern_scientific',
  'The device believed to be a time machine is actually a wormhole generator connected to a similar planet.',
  'A world-class biologist and physicist jointly created the foundation of wormhole travel, immortal cell research, and planetary experimentation.',
  '[{"name": "Wormhole Experiment", "description": "The machine activates and sends Leon and Aria to the other planet."}]'::jsonb,
  '["Physics laboratory", "Urban modern city", "Research facility"]'::jsonb,
  'Earth scenes should remain grounded, modern, and realistic rather than fantasy-like.',
  'realistic laboratory, urban modern world, clean scientific equipment, cold fluorescent light',
  'A near-future Earth research environment where scientists mistake a wormhole generator for a time machine, leading to accidental travel to another planet.',
  '{"primary_worldview": false, "technology": "wormhole_generator"}'::jsonb
)
on conflict (project_id, name)
do update set
  summary = excluded.summary,
  era = excluded.era,
  civilization_level = excluded.civilization_level,
  core_rules = excluded.core_rules,
  science_or_magic_rules = excluded.science_or_magic_rules,
  major_events = excluded.major_events,
  major_regions = excluded.major_regions,
  forbidden_settings = excluded.forbidden_settings,
  visual_tone = excluded.visual_tone,
  prompt_summary = excluded.prompt_summary,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 3. Characters
-- =========================================================

insert into public.characters (
  id,
  project_id,
  worldview_id,
  name,
  code_name,
  role,
  gender,
  age_range,
  personality,
  speech_style,
  appearance,
  outfit,
  signature_items,
  goal,
  weakness,
  backstory,
  forbidden_settings,
  prompt_summary,
  negative_prompt,
  metadata
)
values
(
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Leon',
  'protagonist_leon',
  'protagonist',
  'male',
  '20s',
  'Adaptive, physically fearless, protective, pragmatic, and emotionally restrained under pressure.',
  'Direct, concise, slightly sarcastic, with calm wording even during danger.',
  'An athletic young man with a parkour and climbing background, lean muscles, sharp focused eyes, short dark hair, and controlled body language.',
  'Weathered dark travel jacket, flexible climbing pants, worn boots, finger wraps, and a small survival pouch.',
  '["finger wraps", "worn climbing shoes", "silver emergency whistle"]'::jsonb,
  'Return to Earth while protecting his companions and uncovering the truth of the new world.',
  'He over-relies on physical action and tends to carry guilt alone.',
  'Leon was a parkour and climbing champion on Earth before being pulled into the wormhole incident.',
  'Do not portray Leon as a chosen-one magic hero. His strength should come from athletic skill, adaptability, and human resilience.',
  'Leon is an athletic young male protagonist with short dark hair, sharp focused eyes, a weathered dark travel jacket, finger wraps, and agile parkour-like movement. He feels calm, restrained, and protective in a tragic science fantasy world.',
  'no heavy armor, no magical aura, no childish expression, no bulky bodybuilder proportions',
  '{"origin": "Earth", "combat_style": "parkour_climbing_survival", "arc": "survivor_to_lonely_returner"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Aria',
  'main_character_aria',
  'main_character',
  'female',
  '20s',
  'Highly intelligent, analytical, emotionally suppressed, persistent, and capable of becoming ruthless after loss.',
  'Logical and precise at first, later colder and more commanding as grief turns into revenge.',
  'A young female researcher assistant with observant eyes, shoulder-length dark brown hair, a composed face, and an intense gaze that hides emotional instability.',
  'Practical research coat adapted into travel clothing, dark inner layers, utility belt, and worn field boots.',
  '["damaged research notebook", "small metal measuring device", "broken lab ID tag"]'::jsonb,
  'Understand the wormhole, survive the new planet, and later destroy the northern civilization after Kael''s death.',
  'Her suppressed grief can turn into obsession and violent certainty.',
  'Aria was the physicist assistant connected to the wormhole experiment on Earth. She becomes central to understanding the scientific truth of the planet.',
  'Do not portray Aria as purely evil from the beginning. Her fall should come from grief, knowledge, and revenge.',
  'Aria is an intelligent young female researcher with shoulder-length dark brown hair, observant eyes, a damaged research notebook, and practical dark field clothing. Her expression is calm and analytical, with hidden grief that can become ruthless.',
  'no witch costume, no fantasy princess dress, no cheerful idol-like expression',
  '{"origin": "Earth", "expertise": "physics_assistant", "arc": "researcher_to_revenge_driven_antagonistic_force"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Kael',
  'mentor_kael',
  'mentor',
  'male',
  '30s',
  'Rugged, warm beneath a rough exterior, strategic, secretive, and deeply responsible for his mercenary group.',
  'Rough, practical, and blunt, but occasionally warm and protective.',
  'A rugged northern-born mercenary leader with weathered skin, tied-back ash-brown hair, tired eyes, light scars, and the posture of someone hiding his past.',
  'Layered mercenary cloak, worn leather armor pieces, dark scarf, utility straps, and a concealed northern emblem.',
  '["concealed northern emblem", "old mercenary blade", "dark scarf"]'::jsonb,
  'Protect the mercenary group while hiding his northern origin and guiding Leon and Aria toward the truth.',
  'He hides too much truth to protect others, which eventually contributes to tragedy.',
  'Kael was born in the north but lives as a southern mercenary leader, concealing his origin from his companions.',
  'Do not reveal Kael as openly northern too early. His identity should feel hidden, conflicted, and tragic.',
  'Kael is a rugged male mercenary leader with tied-back ash-brown hair, tired eyes, light scars, a layered dark cloak, and a concealed northern emblem. He looks rough, protective, and burdened by secrets.',
  'no royal crown, no clean noble costume, no exaggerated villain look',
  '{"origin": "Northern civilization", "public_identity": "southern_mercenary_leader", "arc": "hidden_origin_mentor_to_tragic_loss"}'::jsonb
)
on conflict (project_id, name)
do update set
  worldview_id = excluded.worldview_id,
  code_name = excluded.code_name,
  role = excluded.role,
  gender = excluded.gender,
  age_range = excluded.age_range,
  personality = excluded.personality,
  speech_style = excluded.speech_style,
  appearance = excluded.appearance,
  outfit = excluded.outfit,
  signature_items = excluded.signature_items,
  goal = excluded.goal,
  weakness = excluded.weakness,
  backstory = excluded.backstory,
  forbidden_settings = excluded.forbidden_settings,
  prompt_summary = excluded.prompt_summary,
  negative_prompt = excluded.negative_prompt,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 4. Locations
-- =========================================================

insert into public.locations (
  id,
  project_id,
  worldview_id,
  name,
  type,
  description,
  atmosphere,
  visual_elements,
  related_factions,
  related_characters,
  prompt_summary,
  negative_prompt,
  metadata
)
values
(
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Southern Mercenary Camp',
  'village',
  'A rough settlement and field base for mercenaries in the southern territories, built to survive attacks from giant lifeforms.',
  'Dusty, tense, communal, survival-focused, warm firelight against a dangerous wilderness.',
  '["wooden barricades", "patched tents", "watch towers", "monster bone tools", "campfires", "worn training grounds"]'::jsonb,
  '["Southern Mercenary Guild"]'::jsonb,
  '["Leon", "Aria", "Kael"]'::jsonb,
  'A rugged southern mercenary camp with patched tents, wooden barricades, watch towers, campfires, monster bone tools, and a dangerous wilderness surrounding it. The mood is survival-focused and tense.',
  'no modern city buildings, no polished castle, no sci-fi neon signs',
  '{"region": "south", "usage": ["early_survival", "mercenary_group_intro", "character_bonding"]}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000302',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Northern Energy Citadel',
  'castle',
  'The center of the northern immortal civilization, where immortal energy devices and airflow control systems are maintained.',
  'Cold, monumental, oppressive, technologically advanced but ancient in appearance.',
  '["blue energy core", "metallic towers", "frozen bridges", "giant creature bones", "aerial ducts", "pale northern sky"]'::jsonb,
  '["Northern Immortal Civilization"]'::jsonb,
  '["Kael", "Aria"]'::jsonb,
  'A cold northern citadel with metallic towers, blue immortal energy cores, frozen bridges, giant creature bones integrated into architecture, and ancient airflow control systems under a pale sky.',
  'no cozy village mood, no bright fantasy castle colors, no modern skyscraper city',
  '{"region": "north", "usage": ["northern_conflict", "immortal_energy_reveal", "revenge_arc"]}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000303',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Frozen Climate Control Facility',
  'laboratory',
  'A hidden facility where the biologist froze himself and where the planetary climate-control device can be stopped.',
  'Silent, sacred, frozen, scientific, lonely, and final.',
  '["frozen glass chamber", "ancient control panels", "ice-covered cables", "dim blue light", "sleeping biologist", "circular airflow device"]'::jsonb,
  '["Northern Immortal Civilization"]'::jsonb,
  '["Leon", "Aria"]'::jsonb,
  'A frozen ancient laboratory with a glass chamber, sleeping biologist, ice-covered cables, dim blue light, circular airflow device, and silent climate-control machinery.',
  'no warm sunlight, no medieval tavern, no crowded marketplace',
  '{"region": "far_north", "usage": ["final_reveal", "ending", "return_to_earth"]}'::jsonb
)
on conflict (project_id, name)
do update set
  worldview_id = excluded.worldview_id,
  type = excluded.type,
  description = excluded.description,
  atmosphere = excluded.atmosphere,
  visual_elements = excluded.visual_elements,
  related_factions = excluded.related_factions,
  related_characters = excluded.related_characters,
  prompt_summary = excluded.prompt_summary,
  negative_prompt = excluded.negative_prompt,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 5. Factions
-- =========================================================

insert into public.factions (
  id,
  project_id,
  worldview_id,
  name,
  type,
  goal,
  values,
  technology_level,
  symbol,
  color_palette,
  representative_characters,
  enemy_factions,
  prompt_summary,
  metadata
)
values
(
  '00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Southern Mercenary Guild',
  'mercenary_group',
  'Survive in the southern territories, protect settlements, and earn resources through dangerous expeditions.',
  'Practical loyalty, survival, contract-based trust, strength, and shared hardship.',
  'medieval_survival_tools',
  'A cracked shield marked with a giant beast claw.',
  'rust brown, dark leather, ember orange',
  '["Kael", "Leon", "Aria"]'::jsonb,
  '["Northern Immortal Civilization"]'::jsonb,
  'A rugged southern mercenary guild built around survival, contracts, and defense against giant lifeforms. Their visual identity uses cracked shields, leather, ember firelight, and monster-bone tools.',
  '{"region": "south", "social_structure": "mercenary_band"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000402',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'Northern Immortal Civilization',
  'empire',
  'Maintain control over immortal energy, preserve northern dominance, and protect the climate-control systems.',
  'Immortality, order, control, secrecy, hierarchy, and technological preservation.',
  'bio_energy_airflow_technology',
  'A blue circular energy sigil resembling an eye inside a frozen ring.',
  'cold blue, silver, pale white, deep black',
  '["Kael"]'::jsonb,
  '["Southern Mercenary Guild"]'::jsonb,
  'A cold northern civilization that monopolizes immortal energy and ancient airflow technology. Their visual identity uses blue energy sigils, silver structures, frozen rings, and monumental architecture.',
  '{"region": "north", "social_structure": "immortal_hierarchy"}'::jsonb
)
on conflict (project_id, name)
do update set
  worldview_id = excluded.worldview_id,
  type = excluded.type,
  goal = excluded.goal,
  values = excluded.values,
  technology_level = excluded.technology_level,
  symbol = excluded.symbol,
  color_palette = excluded.color_palette,
  representative_characters = excluded.representative_characters,
  enemy_factions = excluded.enemy_factions,
  prompt_summary = excluded.prompt_summary,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 6. Character Relationships
-- =========================================================

insert into public.character_relationships (
  id,
  project_id,
  character_a_id,
  character_b_id,
  relationship_type,
  emotion,
  past_event,
  current_conflict,
  relationship_stage,
  description,
  metadata
)
values
(
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000202',
  'ally',
  'Trust mixed with tension and shared fear.',
  'Leon and Aria crossed the wormhole from Earth together.',
  'They both want survival and truth, but later disagree over revenge and the destruction of the northern civilization.',
  'survival_alliance_to_ideological_conflict',
  'Leon and Aria are Earth-origin companions who rely on each other in the new world, but their paths diverge after grief and revenge reshape Aria.',
  '{"directionality": "mutual", "arc": "ally_to_conflict"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000502',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000203',
  'lover',
  'Hidden admiration, emotional dependence, and unresolved longing.',
  'Kael protected Aria and helped her understand the northern civilization.',
  'Aria does not fully express her feelings before Kael dies, turning her grief into violent revenge.',
  'unspoken_love_to_tragic_loss',
  'Aria secretly loves Kael. His death becomes the emotional trigger for her transformation and war against the north.',
  '{"directionality": "mostly_aria_to_kael", "arc": "hidden_love_to_revenge_trigger"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000503',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000203',
  'mentor',
  'Respect, guarded trust, and strategic dependence.',
  'Kael taught Leon how to survive in the mercenary world and hinted at the truth of the north.',
  'Kael hides too much about his origin, making Leon question him as the northern expedition progresses.',
  'mentor_trust_to_hidden_truth',
  'Kael acts as a mentor and survival guide to Leon, but his hidden northern identity creates tension and eventual tragedy.',
  '{"directionality": "kael_to_leon_guidance", "arc": "mentor_to_tragic_truth"}'::jsonb
)
on conflict (
  project_id,
  character_a_id,
  character_b_id,
  relationship_type
)
do update set
  emotion = excluded.emotion,
  past_event = excluded.past_event,
  current_conflict = excluded.current_conflict,
  relationship_stage = excluded.relationship_stage,
  description = excluded.description,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 7. Style Guide
-- =========================================================

insert into public.style_guides (
  id,
  project_id,
  name,
  animation_style,
  color_palette,
  camera_style,
  lighting_style,
  mood,
  reference_keywords,
  negative_style,
  prompt_prefix,
  prompt_suffix,
  is_default,
  metadata
)
values (
  '00000000-0000-4000-8000-000000000601',
  '00000000-0000-4000-8000-000000000001',
  'Cinematic Anime Dark Fantasy',
  'cinematic anime',
  'cold blue, ash gray, deep black, faint gold, ember orange accents',
  'slow tracking shots, dramatic close-ups, wide lonely landscape shots, restrained handheld tension',
  'high contrast, volumetric light, cold backlight, dim firelight, foggy atmospheric depth',
  'tragic, mysterious, epic, lonely, restrained, emotionally heavy',
  '["cinematic anime", "tragic science fantasy", "cold blue atmosphere", "volumetric lighting", "vast lonely landscapes", "dramatic close-up"]'::jsonb,
  'avoid comedic chibi style, avoid bright idol colors, avoid plastic 3d cartoon look, avoid pure medieval magic fantasy',
  'Cinematic anime dark science fantasy style, cold blue and ash gray palette, tragic atmosphere, volumetric light, detailed character acting, consistent character design.',
  'High quality animation frame, coherent lighting, emotionally restrained expression, no inconsistent costume changes, no extra limbs, no distorted hands.',
  true,
  '{"default_for_project": true, "intended_tool": "google_flow"}'::jsonb
)
on conflict (project_id, name)
do update set
  animation_style = excluded.animation_style,
  color_palette = excluded.color_palette,
  camera_style = excluded.camera_style,
  lighting_style = excluded.lighting_style,
  mood = excluded.mood,
  reference_keywords = excluded.reference_keywords,
  negative_style = excluded.negative_style,
  prompt_prefix = excluded.prompt_prefix,
  prompt_suffix = excluded.prompt_suffix,
  is_default = excluded.is_default,
  metadata = excluded.metadata,
  updated_at = now();

-- =========================================================
-- 8. Prompt Templates
-- =========================================================

insert into public.prompt_templates (
  id,
  project_id,
  name,
  target_tool,
  template_type,
  template_body,
  variables,
  description,
  is_global,
  metadata
)
values
(
  '00000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000001',
  'Google Flow Character Prompt',
  'google_flow',
  'character',
  '{{style.prompt_prefix}}

Character:
{{character.prompt_summary}}

Personality:
{{character.personality}}

Appearance:
{{character.appearance}}

Outfit:
{{character.outfit}}

Signature items:
{{character.signature_items}}

Negative prompt:
{{character.negative_prompt}}

{{style.prompt_suffix}}',
  '["style.prompt_prefix", "character.prompt_summary", "character.personality", "character.appearance", "character.outfit", "character.signature_items", "character.negative_prompt", "style.prompt_suffix"]'::jsonb,
  'Builds a Google Flow-ready character prompt from character DB and default style guide.',
  false,
  '{"version": 1, "usage": "character_reference_generation"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000702',
  '00000000-0000-4000-8000-000000000001',
  'Google Flow Location Prompt',
  'google_flow',
  'location',
  '{{style.prompt_prefix}}

Location:
{{location.prompt_summary}}

Atmosphere:
{{location.atmosphere}}

Visual elements:
{{location.visual_elements}}

Negative prompt:
{{location.negative_prompt}}

{{style.prompt_suffix}}',
  '["style.prompt_prefix", "location.prompt_summary", "location.atmosphere", "location.visual_elements", "location.negative_prompt", "style.prompt_suffix"]'::jsonb,
  'Builds a Google Flow-ready background/location prompt from location DB and default style guide.',
  false,
  '{"version": 1, "usage": "location_reference_generation"}'::jsonb
),
(
  '00000000-0000-4000-8000-000000000703',
  '00000000-0000-4000-8000-000000000001',
  'Google Flow Scene Prompt',
  'google_flow',
  'scene',
  '{{style.prompt_prefix}}

World:
{{worldview.prompt_summary}}

Location:
{{location.prompt_summary}}

Characters:
{{characters.prompt_summaries}}

Scene action:
{{scene.action}}

Camera:
{{scene.camera}}

Emotion:
{{scene.emotion}}

Continuity rules:
Keep all character appearances, outfits, signature items, and world rules consistent with the database.

{{style.prompt_suffix}}',
  '["style.prompt_prefix", "worldview.prompt_summary", "location.prompt_summary", "characters.prompt_summaries", "scene.action", "scene.camera", "scene.emotion", "style.prompt_suffix"]'::jsonb,
  'Builds a Google Flow-ready scene/video prompt by combining worldview, location, characters, scene action, and style guide.',
  false,
  '{"version": 1, "usage": "scene_video_generation"}'::jsonb
)
on conflict (
  project_id,
  name,
  target_tool,
  template_type
)
do update set
  template_body = excluded.template_body,
  variables = excluded.variables,
  description = excluded.description,
  is_global = excluded.is_global,
  metadata = excluded.metadata,
  updated_at = now();

commit;

-- =========================================================
-- Verification Queries
-- =========================================================
-- Run these manually after seeding.

-- 1. Basic table checks
-- select * from public.projects;
-- select * from public.worldviews;
-- select * from public.characters;
-- select * from public.locations;
-- select * from public.factions;
-- select * from public.character_relationships;
-- select * from public.style_guides;
-- select * from public.prompt_templates;

-- 2. Character-worldview connection check
-- select
--   c.name as character_name,
--   w.name as worldview_name,
--   c.role,
--   c.prompt_summary
-- from public.characters c
-- left join public.worldviews w
--   on c.worldview_id = w.id
-- order by c.name;

-- 3. Character relationship check
-- select
--   ca.name as character_a,
--   cb.name as character_b,
--   cr.relationship_type,
--   cr.emotion,
--   cr.current_conflict
-- from public.character_relationships cr
-- join public.characters ca
--   on cr.character_a_id = ca.id
-- join public.characters cb
--   on cr.character_b_id = cb.id
-- order by cr.relationship_type, character_a, character_b;
