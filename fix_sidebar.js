const fs = require('fs');
const file = '/Users/himanshukumar/Ragweb/src/rag/pages/RagPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const renderReturnStart = content.indexOf('  return (\n    <RagLayout>');
const renderSidebarStart = content.indexOf('          {/* Document Section */}');
const uploadDropzoneEnd = content.indexOf('          </div>\n        </motion.div>\n\n        {/* Main Chat Area - Bento Card */}');

const sidebarJSX = content.substring(renderSidebarStart, uploadDropzoneEnd + 16); // including </div>

const replacement = `
  const renderSidebar = () => (
    <>
${sidebarJSX}
    </>
  );

  return (
    <RagLayout>
      <div className="flex flex-col md:flex-row h-[100dvh] md:h-[calc(100vh-80px)] w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-4 md:gap-6">
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Slide Up */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-canvas rounded-t-3xl border-t border-hairline-soft shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden z-50 md:hidden"
            >
              {renderSidebar()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="hidden md:flex w-[340px] shrink-0 bg-canvas rounded-[2.5rem] border border-hairline-soft shadow-diffusion flex-col overflow-hidden relative z-10"
        >
          {renderSidebar()}
        </motion.div>

        {/* Main Chat Area - Bento Card */}`;

const newContent = content.substring(0, renderReturnStart) + replacement + content.substring(uploadDropzoneEnd + 55);
fs.writeFileSync(file, newContent);
console.log('Done');
