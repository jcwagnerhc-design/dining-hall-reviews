import { useState } from 'react';
import Layout from '../components/Layout';
import TabNav from '../components/TabNav';
import FoodGrid from '../components/FoodGrid';
import SuggestionsTab from '../components/SuggestionsTab';

export default function PublicPage() {
  const [activeTab, setActiveTab] = useState('hot_mains');

  return (
    <Layout>
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="pb-8">
        {activeTab === 'suggestions' ? (
          <SuggestionsTab />
        ) : (
          <FoodGrid tab={activeTab} />
        )}
      </div>
    </Layout>
  );
}
