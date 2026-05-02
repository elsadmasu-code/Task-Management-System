import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjects,
  createProject,
  deleteProject,
} from "../features/projects/projectsSlice";
import { fetchWorkspaces } from "../features/workspaces/workspacesSlice";
import Modal from "../components/ui/Modal";
import Input, { Textarea, Select } from "../components/ui/Input";
import { AvatarGroup } from "../components/ui/Avatar";
import { PageLoader } from "../components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  FolderKanban,
  Users,
  ArrowRight,
  Trash2,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

const PROJECT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
];
const PROJECT_ICONS = ["📁", "🚀", "💡", "🎯", "🔧", "🌟", "🏗️", "📊"];

const ProjectCard = ({ project, onDelete, onClick }) => (
  <div
    onClick={onClick}
    className="card cursor-pointer group transition-all duration-300 hover:-translate-y-1"
    style={{ borderLeft: `3px solid ${project.color}` }}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: project.color + "25" }}
        >
          {project.icon || "📁"}
        </div>
        <div>
          <h3 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-gray-500 capitalize">{project.status}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(project);
        }}
        className="btn-icon w-7 h-7 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
      >
        <Trash2 size={13} />
      </button>
    </div>

    {project.description && (
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
        {project.description}
      </p>
    )}

    <div className="flex items-center justify-between">
      <AvatarGroup
        users={project.members?.map((m) => m.user) || []}
        size="xs"
        max={4}
      />
      <div className="flex items-center gap-1 text-primary-400 text-xs group-hover:translate-x-1 transition-transform">
        Open Board <ArrowRight size={12} />
      </div>
    </div>
  </div>
);

const ProjectPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: projects, isLoading } = useSelector((s) => s.projects);
  const { items: workspaces } = useSelector((s) => s.workspaces);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    workspace: "",
    color: PROJECT_COLORS[0],
    icon: "📁",
  });

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (workspaces.length && !form.workspace) {
      setForm((f) => ({ ...f, workspace: workspaces[0]._id }));
    }
  }, [workspaces, form.workspace]);

  useEffect(() => {
    if (showModal && workspaces.length && !form.workspace) {
      setForm((f) => ({ ...f, workspace: workspaces[0]._id }));
    }
  }, [showModal, workspaces, form.workspace]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    if (!form.workspace) {
      toast.error("Workspace is required");
      return;
    }
    setIsSubmitting(true);
    try {
      await dispatch(createProject(form));
      toast.success("Project created! 🎉");
      setShowModal(false);
      setForm({
        name: "",
        description: "",
        workspace: workspaces[0]?._id || "",
        color: PROJECT_COLORS[0],
        icon: "📁",
      });
    } catch {
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteProject(deleteTarget._id));
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isLoading && projects.length === 0) return <PageLoader />;

  const workspaceOptions = [
    { value: "", label: "Select workspace" },
    ...workspaces.map((w) => ({ value: w._id, label: w.name })),
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="section-title">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderKanban size={64} className="text-gray-700 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            Create your first project and start managing tasks with your team.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={setDeleteTarget}
              onClick={() => navigate(`/projects/${project._id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={
                isSubmitting ||
                !workspaces.length ||
                !form.workspace ||
                !form.name.trim()
              }
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Create Project
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            label="Project Name *"
            placeholder="e.g. Website Redesign"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="What is this project about?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {workspaces.length > 0 ? (
            <Select
              label="Workspace *"
              options={workspaceOptions}
              value={form.workspace}
              onChange={(e) => setForm({ ...form, workspace: e.target.value })}
              required
            />
          ) : (
            <p className="text-sm text-gray-400">
              You need to create a workspace before creating a project.
            </p>
          )}
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-dark-300" : "hover:scale-110"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === icon ? "bg-primary-500/30 ring-2 ring-primary-500" : "hover:bg-white/10"}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Project?"
          size="sm"
          footer={
            <>
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete Project
              </button>
            </>
          }
        >
          <p className="text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{deleteTarget.name}"
            </span>
            ? This will also delete all its tasks.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default ProjectPage;
