import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWorkspaces,
  createWorkspace,
} from "../features/workspaces/workspacesSlice";
import Modal from "../components/ui/Modal";
import Input, { Textarea } from "../components/ui/Input";
import { PageLoader } from "../components/ui/Spinner";
import { Plus, FolderOpen, Users, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const WorkspaceCard = ({ workspace }) => (
  <div className="card p-5 bg-dark-250 border border-white/10 rounded-3xl hover:border-primary-500/30 transition-all">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="w-11 h-11 rounded-2xl bg-primary-500/10 text-primary-300 flex items-center justify-center mb-4">
          <FolderOpen size={18} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          {workspace.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {workspace.description || "No description added yet."}
        </p>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">
          Members
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-primary-300">
          <Users size={14} />
          {workspace.members?.length || 1}
        </div>
      </div>
    </div>
    <div className="mt-5 text-right text-primary-400 text-sm font-medium flex items-center justify-end gap-2">
      View details <ArrowRight size={14} />
    </div>
  </div>
);

const WorkspacePage = () => {
  const dispatch = useDispatch();
  const { items: workspaces, isLoading } = useSelector((s) => s.workspaces);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createWorkspace(form)).unwrap();
      toast.success("Workspace created successfully");
      setShowModal(false);
      setForm({ name: "", description: "" });
    } catch (error) {
      toast.error(error || "Failed to create workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && workspaces.length === 0) return <PageLoader />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Workspaces</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your workspaces and create new spaces for projects.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-6">
            <FolderOpen size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-3">
            No workspaces yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Create a workspace first so you can attach projects and collaborate
            with your team.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-6 py-3 text-sm"
          >
            Create workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace._id} workspace={workspace} />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Workspace"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Create Workspace
            </button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleCreateWorkspace}>
          <Input
            label="Workspace Name *"
            placeholder="e.g. Marketing Team"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Describe the purpose of this workspace"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};

export default WorkspacePage;
