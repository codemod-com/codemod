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
import React from "react";

export default function Styleguide() {
  return (
    <div className="pt-[calc(var(--header-height)+5rem)]">
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Buttons</h1>
        <div className="flex w-full flex-wrap items-center justify-start gap-s">
          <Button intent="primary">Button</Button>

          <Button intent="primary" icon="arrow-right">
            Button
          </Button>

          <Button intent="primary" icon="book-open">
            Docs
          </Button>

          <Button intent="secondary" icon="command" iconPosition="left">
            Button
          </Button>

          <Button intent="primary" arrow>
            Button
          </Button>

          <Button intent="primary" arrow disabled>
            Button
          </Button>

          <Button intent="primary" icon="arrow-right" disabled>
            Button
          </Button>

          <Button intent="primary" icon="arrow-right" loading>
            Button
          </Button>

          <Button intent="secondary" icon="arrow-right" loading>
            Button
          </Button>

          <Button intent="primary-icon-only" icon="copy" />

          <Button intent="secondary-icon-only" icon="arrow-right" />

          <Button glow intent="secondary">
            Glowing
          </Button>
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Inputs</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Input />

          <Input icon="mail" />

          <Input error="There was an error" />

          <Input icon="mail" error="There was an error" />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Select</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Dropdown
            label="Default"
            options={[
              { value: "1", label: "Option 1" },
              {
                value: "2",
                label: "Option 2",
              },
            ]}
          />
          <Dropdown
            label="With error"
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
        <h1 className="s-heading pb-6">Checkbox</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Checkbox />
          <Checkbox checked />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Tags</h1>
        <div className="flex w-full flex-wrap items-start justify-start gap-s">
          <Tag intent="primary">Primary</Tag>
          <Tag intent="default">Default</Tag>
        </div>
      </div>

      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Filter buttons</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <FilterButton intent="default" icon="filter">
            Filter default
          </FilterButton>
          <FilterButton intent="active" icon="filter">
            Filter dismissable
          </FilterButton>
          <FilterButton icon="filter" disabled>
            Filter disabled
          </FilterButton>
        </div>
      </div>

      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Snippets</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <Snippet command="npm tinloof new" />
          <Snippet command="npx codemode learn" />
        </div>
      </div>
      <div className="p-[40px]">
        <h1 className="s-heading pb-6">Tabs</h1>
        <div className="flex w-full flex-col items-start justify-start gap-xs">
          <Tabs
            items={[
              { id: "1", label: "Tab 1" },
              { id: "2", label: "Tab 2 with longer text" },
              { id: "3", label: "Tab 3" },
              { id: "4", label: "Tab 4" },
            ]}
          >
            <TabContent forId="1">Tab 1 content</TabContent>
            <TabContent forId="2">Tab 2 content</TabContent>
            <TabContent forId="3">Tab 3 content</TabContent>
            <TabContent forId="4">Tab 4 content</TabContent>
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
        title="Large-scale Next.js Migration at Cal.com: impact, challenges & lessons learned"
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
        title="Ant Design V5 - Removed Component Migration"
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
        title="ESLint to Biome"
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
        title="Registry"
        imageUrl="https://uca7084de71fddf93019da37f4e9.previews.dropboxusercontent.com/p/thumb/ACP2Dx2k6fG9judy9AKhiXvk_fpSSZ3xUX6ii6iWmA1mF7Yxk6LHAn3HGnmAAUO9FqSGx42Q7ziz2tLTb117EjgZN4apQ_glvgbGxew2uXblYygmmVJLbzqfQJ5gUgSBLQbLYaPRozy8xZASKH-6gw2Liq8W8XNd3cbcH6umBp5oDpba4wPeu4679kpUP0hprdjpJBdeoqiBtCjDotnXa5JRTp37MPBjdTiMvKUjd0rwRC5EvtHdT8flz73A9H5l-3pnnjuYu3p2KKya3goJOT6NL4JQchwsFV8iRpJRZ95PapXHEMN8OtXMQ2Icp-hfqNSGFCl-XRxJXedA9Fh7JE-g8wzps6ybKZS6hpJ1kTjJ5DGQNi3OAAzhlmg-bxy4Pms/p.png"
      />
      <Job
        department="Engineering"
        location="Remote"
        title="Senior Software Engineer"
      />
    </div>
  );
}
