import { useTranslation } from "react-i18next";
import Automation from "@/app/api/og/templates/Automation";
import AutomationToFrom from "@/app/api/og/templates/AutomationToFrom";
import BlogArticle from "@/app/api/og/templates/BlogArticle";
import Job from "@/app/api/og/templates/Job";
import Registry from "@/app/api/og/templates/Registry";
import Button from "@/components/shared/Button";
import Checkbox from "@/components/shared/Checkbox";
import Dropdown from "@/components/shared/Dropdown";
import FilterButton from "@/components/shared/FilterButton";
import Input from "@/components/shared/Input";
import Snippet from "@/components/shared/Snippet";
import Tabs, { TabContent } from "@/components/shared/Tabs";
import Tag from "@/components/shared/Tag";

export default function Styleguide() {
const { t } = useTranslation("(website)/styleguide");

  return (
    <div className="pt-[calc(var(--header-height)+5rem)]">
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('buttons')}</h1>
        <div className="flex w-full flex-wrap items-center justify-start gap-s">
          <Button intent="primary">{t('button')}</Button>

          <Button intent="primary" icon="arrow-right">{t('button-fragment')}</Button>

          <Button intent="primary" icon="book-open">{t('docs-fragment')}</Button>

          <Button intent="secondary" icon="command" iconPosition="left">{t('button-fragment-duplicate-1')}</Button>

          <Button intent="primary" arrow>{t('button-fragment-duplicate-2')}</Button>

          <Button intent="primary" arrow disabled>{t('button-fragment-duplicate-3')}</Button>

          <Button intent="primary" icon="arrow-right" disabled>{t('button-fragment-duplicate-4')}</Button>

          <Button intent="primary" icon="arrow-right" loading>{t('button-fragment-duplicate-5')}</Button>

          <Button intent="secondary" icon="arrow-right" loading>{t('button-fragment-duplicate-6')}</Button>

          <Button intent="primary-icon-only" icon="copy" />

          <Button intent="secondary-icon-only" icon="arrow-right" />

          <Button glow intent="secondary">{t('glowing')}</Button>
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('inputs')}</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Input />

          <Input icon="mail" />

          <Input error="There was an error" />

          <Input icon="mail" error="There was an error" />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('select')}</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Dropdown
            label={t('default-label')}
            options={[
              { value: "1", label: "Option 1" },
              {
                value: "2",
                label: "Option 2",
              },
            ]}
          />
          <Dropdown
            label={t('with-error-label')}
            error="There was an error"
            options={[
              { value: "1", label: "Option 1" },
              {
                value: "2",
                label: "Option 2",
              },
            ]}
          />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('checkbox')}</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Checkbox />
          <Checkbox checked />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('tags')}</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Tag intent="primary">{t('primary')}</Tag>
          <Tag intent="default">{t('default')}</Tag>
        </div>
      </div>

      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('filter-buttons')}</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <FilterButton intent="default" icon="filter">{t('filter-default')}</FilterButton>
          <FilterButton intent="active" icon="filter">{t('filter-dismissable')}</FilterButton>
          <FilterButton icon="filter" disabled>{t('filter-disabled')}</FilterButton>
        </div>
      </div>

      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('snippets')}</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <Snippet command="npm tinloof new" />
          <Snippet command="npx codemode learn" />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">{t('tabs')}</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <Tabs
            items={[
              { id: "1", label: "Tab 1" },
              { id: "2", label: "Tab 2 with longer text" },
              { id: "3", label: "Tab 3" },
              { id: "4", label: "Tab 4" },
            ]}
          >
            <TabContent forId="1">{t('tab-1-content')}</TabContent>
            <TabContent forId="2">{t('tab-2-content')}</TabContent>
            <TabContent forId="3">{t('tab-3-content')}</TabContent>
            <TabContent forId="4">{t('tab-4-content')}</TabContent>
          </Tabs>
        </div>
      </div>

      {/* <div className="p-[40px]">
        <h1 className="s-heading pb-6">Registry Card</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <RegistryCard />
        </div>
      </div> */}

      <BlogArticle
        title={t('large-scale-nextjs-migration')}
        authors={[
          {
            image:
              "https://cdn.sanity.io/images/aho0e32c/production/4e794c38724ba7a80f802d9649a043f38b4ce211-212x212.png?w=100&fit=max&auto=format",
            name: "Alex Bit",
          },
          {
            image:
              "https://cdn.sanity.io/images/aho0e32c/production/55acbf919a514f3f1149a3ffd909d082fb7c79c9-460x460.jpg?w=100&fit=max&auto=format",
            name: "Greg Pabien",
          },
        ]}
      />
      <Automation
        title={t('ant-design-v5-migration')}
        automationAuthor={{
          image:
            "https://cdn.sanity.io/images/aho0e32c/production/61b763a05f41a7aea0b3b3265ff0fc83534ef28c-20x21.svg?w=20&fit=max&auto=format",
          name: "John Doe",
        }}
        automationFrom={{
          image:
            "https://cdn.sanity.io/images/aho0e32c/production/ac9e7bfe893c827d96f3a6f8f500f4d1464811c7-23x20.svg?w=1200&fit=max&auto=format",
          framework: "React",
        }}
      />
      <AutomationToFrom
        title={t('eslint-to-biome')}
        automationFrom={{
          image:
            "https://cdn.sanity.io/images/aho0e32c/production/9072bff9a7ad7a7b6dfc7c9d0d058f278b7a9e17-2500x2197.svg?w=20&fit=max&auto=format",
          framework: "Eslint",
        }}
        automationTo={{
          image:
            "https://cdn.sanity.io/images/aho0e32c/production/9072bff9a7ad7a7b6dfc7c9d0d058f278b7a9e17-2500x2197.svg?w=20&fit=max&auto=format",
          framework: "Biome",
        }}
      />
      <Registry
        title={t('registry')}
        imageUrl="https://uca7084de71fddf93019da37f4e9.previews.dropboxusercontent.com/p/thumb/ACP2Dx2k6fG9judy9AKhiXvk_fpSSZ3xUX6ii6iWmA1mF7Yxk6LHAn3HGnmAAUO9FqSGx42Q7ziz2tLTb117EjgZN4apQ_glvgbGxew2uXblYygmmVJLbzqfQJ5gUgSBLQbLYaPRozy8xZASKH-6gw2Liq8W8XNd3cbcH6umBp5oDpba4wPeu4679kpUP0hprdjpJBdeoqiBtCjDotnXa5JRTp37MPBjdTiMvKUjd0rwRC5EvtHdT8flz73A9H5l-3pnnjuYu3p2KKya3goJOT6NL4JQchwsFV8iRpJRZ95PapXHEMN8OtXMQ2Icp-hfqNSGFCl-XRxJXedA9Fh7JE-g8wzps6ybKZS6hpJ1kTjJ5DGQNi3OAAzhlmg-bxy4Pms/p.png"
      />
      <Job
        department="Engineering"
        location="Remote"
        title={t('senior-software-engineer')}
      />
    </div>
  );
}
