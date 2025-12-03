/**
 * Módulo de Almacenamiento - Supabase Storage
 * Maneja upload/download de archivos
 */

const StorageModule = (() => {
  
  const upload = async (bucket, path, file) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file);
      if (error) throw error;
      console.log(' Archivo subido');
      return { success: true, data };
    } catch (error) {
      console.error(' Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const download = async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getPublicUrl = (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const delete_ = async (bucket, path) => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      console.log(' Archivo eliminado');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const list = async (bucket, path = '') => {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(path);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { upload, download, getPublicUrl, delete: delete_, list };
})();
