import React, { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  title,
  description,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default PageWrapper;
