-- AUTH: Verify Email
-- Función para verificar email y actualizar status del usuario

CREATE OR REPLACE FUNCTION verify_email(p_user_id UUID, p_email_token VARCHAR)
RETURNS TABLE(success BOOLEAN, message VARCHAR) AS $$
DECLARE
  v_token_exists BOOLEAN;
  v_token_valid BOOLEAN;
BEGIN
  -- Verificar que el token existe y es válido
  SELECT EXISTS(
    SELECT 1 FROM email_verifications 
    WHERE user_id = p_user_id 
    AND token = p_email_token 
    AND expires_at > NOW()
    AND verified_at IS NULL
  ) INTO v_token_exists;

  IF NOT v_token_exists THEN
    RETURN QUERY SELECT FALSE, 'Token inválido o expirado'::VARCHAR;
    RETURN;
  END IF;

  -- Actualizar email como verificado
  UPDATE email_verifications 
  SET verified_at = NOW()
  WHERE user_id = p_user_id AND token = p_email_token;

  -- Actualizar status del usuario
  UPDATE users 
  SET status = 'active'
  WHERE id = p_user_id;

  RETURN QUERY SELECT TRUE, 'Email verificado exitosamente'::VARCHAR;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
