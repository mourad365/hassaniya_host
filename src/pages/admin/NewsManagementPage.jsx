import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import ContentManagement from '@/components/admin/ContentManagement';
import NewsForm from '@/components/admin/NewsForm';

const NewsManagementPage = () => {
  const { t } = useTranslation();

  const columns = [
    { key: 'title', label: 'العنوان', type: 'excerpt' },
    { key: 'category', label: 'الفئة', type: 'text' },
    { key: 'priority', label: 'الأولوية', type: 'text' },
    { key: 'location', label: 'الموقع', type: 'text' },
    { key: 'author_name', label: 'المؤلف', type: 'text' },
    { key: 'publish_date', label: 'تاريخ النشر', type: 'date' },
    { key: 'status', label: 'الحالة', type: 'status' },
  ];

  return (
    <>
      <Helmet>
        <title>إدارة الأخبار - {t('siteName')}</title>
      </Helmet>
      <ContentManagement
        contentType="news"
        tableName="news"
        title="إدارة الأخبار"
        FormComponent={NewsForm}
        columns={columns}
      />
    </>
  );
};

export default NewsManagementPage;
