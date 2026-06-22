-- Atualiza as imagens dos imóveis no Supabase para os arquivos enviados ao GitHub.
-- Execute no SQL Editor do Supabase apenas se o site estiver usando DATA_MODE='supabase' ou 'auto' com Supabase configurado.

begin;

delete from public.imobagent_20260504_ready_property_images
where tenant_id = 'default'
  and listing_code in ('L92502', 'L10003', 'V10001', 'V10009', 'I10005', 'L10006', 'V10004', 'V10008', 'C10007', 'V10002');

insert into public.imobagent_20260504_ready_property_images
  (tenant_id, listing_code, image_url, alt_text, display_order, is_cover)
values
  ('default', 'L92502', 'L92502-01.jpg', 'Sala integrada do apartamento no Saguaçu', 1, true),
  ('default', 'L92502', 'L92502-02.jpg', 'Cozinha planejada do apartamento no Saguaçu', 2, false),
  ('default', 'L92502', 'L92502-03.jpg', 'Quarto principal do apartamento no Saguaçu', 3, false),
  ('default', 'L92502', 'L92502-04.jpg', 'Segundo quarto do apartamento no Saguaçu', 4, false),
  ('default', 'L92502', 'L92502-05.jpg', 'Banheiro do apartamento no Saguaçu', 5, false),
  ('default', 'L10003', 'L10003-01.jpg', 'Sala do apartamento no América', 1, true),
  ('default', 'L10003', 'L10003-02.jpg', 'Sacada do apartamento no América', 2, false),
  ('default', 'L10003', 'L10003-03.jpg', 'Suíte do apartamento no América', 3, false),
  ('default', 'L10003', 'L10003-04.jpg', 'Cozinha do apartamento no América', 4, false),
  ('default', 'V10001', 'V10001-01.jpg', 'Sala ampla do apartamento em Atiradores', 1, true),
  ('default', 'V10001', 'V10001-02.jpg', 'Quarto do apartamento em Atiradores', 2, false),
  ('default', 'V10001', 'V10001-03.jpg', 'Academia do condomínio em Atiradores', 3, false),
  ('default', 'V10001', 'V10001-04.jpg', 'Segundo quarto do apartamento em Atiradores', 4, false),
  ('default', 'V10001', 'V10001-05.jpg', 'Sacada gourmet em Atiradores', 5, false),
  ('default', 'V10001', 'V10001-06.jpg', 'Espaço gourmet do apartamento em Atiradores', 6, false),
  ('default', 'V10009', 'V10009-01.jpg', 'Fachada da casa em condomínio em Pirabeiraba', 1, true),
  ('default', 'V10009', 'V10009-02.jpg', 'Sala da casa em condomínio em Pirabeiraba', 2, false),
  ('default', 'V10009', 'V10009-03.jpg', 'Espaço gourmet da casa em Pirabeiraba', 3, false),
  ('default', 'V10009', 'V10009-04.jpg', 'Suíte principal da casa em Pirabeiraba', 4, false),
  ('default', 'V10009', 'V10009-05.jpg', 'Quarto da casa em Pirabeiraba', 5, false),
  ('default', 'V10009', 'V10009-06.jpg', 'Jardim da casa em Pirabeiraba', 6, false),
  ('default', 'I10005', 'I10005-01.jpg', 'Ambiente integrado do studio no Centro', 1, true),
  ('default', 'I10005', 'I10005-02.jpg', 'Cozinha do studio no Centro', 2, false),
  ('default', 'I10005', 'I10005-03.jpg', 'Sala compacta do studio no Centro', 3, false),
  ('default', 'I10005', 'I10005-04.jpg', 'Banheiro do studio no Centro', 4, false),
  ('default', 'L10006', 'L10006-01.jpg', 'Fachada da casa no Santo Antônio', 1, true),
  ('default', 'L10006', 'L10006-02.jpg', 'Sala da casa no Santo Antônio', 2, false),
  ('default', 'L10006', 'L10006-03.jpg', 'Cozinha da casa no Santo Antônio', 3, false),
  ('default', 'L10006', 'L10006-04.jpg', 'Quarto da casa no Santo Antônio', 4, false),
  ('default', 'L10006', 'L10006-05.jpg', 'Área externa da casa no Santo Antônio', 5, false),
  ('default', 'V10004', 'V10004-01.jpg', 'Fachada do sobrado no Costa e Silva', 1, true),
  ('default', 'V10004', 'V10004-02.jpg', 'Sala do sobrado no Costa e Silva', 2, false),
  ('default', 'V10004', 'V10004-03.jpg', 'Cozinha do sobrado no Costa e Silva', 3, false),
  ('default', 'V10004', 'V10004-04.jpg', 'Suíte do sobrado no Costa e Silva', 4, false),
  ('default', 'V10004', 'V10004-05.jpg', 'Espaço gourmet do sobrado no Costa e Silva', 5, false),
  ('default', 'V10004', 'V10004-06.jpg', 'Banheiro do sobrado no Costa e Silva', 6, false),
  ('default', 'V10008', 'V10008-01.jpg', 'Sala do apartamento no Anita Garibaldi', 1, true),
  ('default', 'V10008', 'V10008-02.jpg', 'Sacada do apartamento no Anita Garibaldi', 2, false),
  ('default', 'V10008', 'V10008-03.jpg', 'Quarto do apartamento no Anita Garibaldi', 3, false),
  ('default', 'V10008', 'V10008-04.jpg', 'Cozinha do apartamento no Anita Garibaldi', 4, false),
  ('default', 'C10007', 'C10007-01.jpg', 'Recepção da sala comercial no Centro', 1, true),
  ('default', 'C10007', 'C10007-02.jpg', 'Escritório da sala comercial no Centro', 2, false),
  ('default', 'C10007', 'C10007-03.jpg', 'Sala de reunião comercial no Centro', 3, false),
  ('default', 'C10007', 'C10007-04.jpg', 'Banheiro da sala comercial no Centro', 4, false),
  ('default', 'V10002', 'V10002-01.jpg', 'Fachada da casa no Glória', 1, true),
  ('default', 'V10002', 'V10002-02.jpg', 'Sala da casa no Glória', 2, false),
  ('default', 'V10002', 'V10002-03.jpg', 'Cozinha da casa no Glória', 3, false),
  ('default', 'V10002', 'V10002-04.jpg', 'Quarto da casa no Glória', 4, false),
  ('default', 'V10002', 'V10002-05.jpg', 'Quintal da casa no Glória', 5, false);
on conflict (tenant_id, listing_code, image_url) do update set
  alt_text = excluded.alt_text,
  display_order = excluded.display_order,
  is_cover = excluded.is_cover;

commit;
