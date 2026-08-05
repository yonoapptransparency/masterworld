import { useState, useEffect, useRef } from 'react';

export const useAppForm = (editApp: any, editingAppId: string | null, appsList: any[], categories: string[]) => {
  const prevEditingIdRef = useRef<string | null>(null);

  const [formFields, setFormFields] = useState<any>({
    name: '',
    slug: '',
    icon_url: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    og_image_url: '',
    canonical_url: '',
    target_region: '',
    safety_status: 'Verified',
    serial_number: '',
    version: '1.0',
    file_size: 'Unknown',
    developer: 'Admin',
    rating: 5.0,
    is_new: true,
    is_coming_soon: false,
    publish_date: '',
    release_notes: '',
    more_information_url: '',
    video_url: '',
    red_box_msg: '',
    yellow_box_msg: '',
    idea_box_msg: '',
    features_html: '',
    custom_admin_box_heading: '',
    custom_admin_box_html: '',
    description_html: '',
    category_list: [] as string[],
    custom_category: '',
    faqs: [] as {question: string, answer: string}[],
    screenshots: [] as string[],
  });

  const [activeFormTab, setActiveFormTab] = useState<'general' | 'seo' | 'content' | 'alerts' | 'faqs' | 'screenshots'>('general');

  useEffect(() => {
    // Only re-populate form fields when the user actively selects a DIFFERENT app or switches to new app mode
    if (prevEditingIdRef.current !== editingAppId) {
      prevEditingIdRef.current = editingAppId;

      if (editingAppId !== null && editingAppId !== '') {
        setFormFields({
          name: editApp?.name || '',
          slug: editApp?.slug || '',
          icon_url: editApp?.icon_url || '',
          seo_title: editApp?.seo_title || '',
          seo_description: editApp?.seo_description || '',
          seo_keywords: editApp?.seo_keywords || '',
          og_image_url: editApp?.og_image_url || '',
          canonical_url: editApp?.canonical_url || '',
          target_region: editApp?.target_region || '',
          safety_status: editApp?.safety_status || 'Verified',
          serial_number: editApp?.serial_number !== undefined ? editApp.serial_number : '',
          version: editApp?.version || '1.0',
          file_size: editApp?.file_size || 'Unknown',
          developer: editApp?.developer || 'Admin',
          rating: editApp?.rating !== undefined ? editApp.rating : 5.0,
          is_new: editApp ? !!editApp.is_new : true,
          is_coming_soon: editApp ? !!editApp.is_coming_soon : false,
          publish_date: editApp?.publish_date ? new Date(new Date(editApp.publish_date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
          release_notes: editApp?.release_notes || '',
          more_information_url: editApp?.more_information_url || '',
          video_url: editApp?.video_url || '',
          red_box_msg: editApp?.red_box_msg || '',
          yellow_box_msg: editApp?.yellow_box_msg || '',
          idea_box_msg: editApp?.idea_box_msg || '',
          features_html: editApp?.features_html || '',
          custom_admin_box_heading: editApp?.custom_admin_box_heading || '',
          custom_admin_box_html: editApp?.custom_admin_box_html || '',
          description_html: editApp?.description_html || '',
          category_list: (() => {
            const allCats = editApp?.category ? editApp.category.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
            const categoriesLower = (categories || []).map((cg: string) => cg.toLowerCase());
            return allCats.filter((c: string) => categoriesLower.includes(c.toLowerCase()));
          })(),
          custom_category: (() => {
            const allCats = editApp?.category ? editApp.category.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
            const categoriesLower = (categories || []).map((cg: string) => cg.toLowerCase());
            const customCats = allCats.filter((c: string) => !categoriesLower.includes(c.toLowerCase()));
            return customCats.filter((c, i) => customCats.findIndex(x => x.toLowerCase() === c.toLowerCase()) === i).join(', ');
          })(),
          faqs: editApp?.faqs || [],
          screenshots: editApp?.screenshots || []
        });
      } else if (editingAppId === '') {
        setFormFields({
          name: '',
          slug: '',
          icon_url: '',
          seo_title: '',
          seo_description: '',
          seo_keywords: '',
          og_image_url: '',
          canonical_url: '',
          target_region: '',
          safety_status: 'Verified',
          serial_number: appsList.length + 1,
          version: '1.0',
          file_size: 'Unknown',
          developer: 'Admin',
          rating: 5.0,
          is_new: true,
          is_coming_soon: false,
          publish_date: '',
          release_notes: '',
          more_information_url: '',
          video_url: '',
          red_box_msg: '',
          yellow_box_msg: '',
          idea_box_msg: '',
          features_html: '',
          custom_admin_box_heading: '',
          custom_admin_box_html: '',
          description_html: '',
          category_list: [] as string[],
          custom_category: '',
          faqs: [] as {question: string, answer: string}[],
          screenshots: [] as string[],
        });
      }
    }
  }, [editingAppId, editApp, categories, appsList.length]);

  const handleFieldChange = (field: string, value: any) => {
    setFormFields((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleQuickClean = () => {
    setFormFields((prev: any) => ({
      ...prev,
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      og_image_url: '',
      canonical_url: '',
      target_region: '',
      release_notes: '',
      more_information_url: '',
      video_url: '',
      red_box_msg: '',
      yellow_box_msg: '',
      idea_box_msg: '',
      features_html: '',
      custom_admin_box_heading: '',
      custom_admin_box_html: '',
      description_html: '',
      faqs: [],
      screenshots: [],
    }));
  };

  return {
    formFields,
    setFormFields,
    activeFormTab,
    setActiveFormTab,
    handleFieldChange,
    handleQuickClean
  };
};
