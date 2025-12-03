-- AUTH: Reset Password
-- Función para manejar reset de contraseña

CREATE OR REPLACE FUNCTION reset_password(p_user_id UUID, p_new_password VARCHAR)
RETURNS TABLE(success BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_user_exists BOOLEAN;
BEGIN
  -- Verificar que el usuario existe
  SELECT EXISTS(SELECT 1 FROM users WHERE id = p_user_id) INTO v_user_exists;
  
  IF NOT v_user_exists THEN
    RETURN QUERY SELECT FALSE, 'Usuario no encontrado'::VARCHAR;
    RETURN;
  END IF;

  -- Actualizar contraseña en auth.users
  UPDATE auth.users 
  SET encrypted_password = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_user_id;

  -- Log del cambio de contraseña
  INSERT INTO logs (user_id, action, resource_type, resource_id, status_code, ip_address)
  VALUES (p_user_id, 'password_reset', 'user', p_user_id::VARCHAR, 200, NULL);

  RETURN QUERY SELECT TRUE, 'Contraseña actualizada exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
