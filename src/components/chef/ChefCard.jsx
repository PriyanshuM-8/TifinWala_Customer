import { Link } from 'react-router-dom';
import { ChefHat, MapPin, ShieldCheck, ArrowRight, Star, UtensilsCrossed } from 'lucide-react';

export const ChefCard = ({ chef }) => {
  if (!chef) return null;

  const chefId = chef.userId?._id || chef.userId || chef._id;
  const kitchenName = chef.kitchenName || 'Homemade Kitchen';
  const ownerName = chef.ownerName || 'Home Chef';
  const city = chef.city || 'Lucknow';
  const serviceRadius = chef.serviceRadiusKm || 10;
  const rating = chef.rating || 0;
  const reviewCount = chef.reviewCount || 0;
  const sampleFoods = Array.isArray(chef.sampleFoods) ? chef.sampleFoods : [];

  const cuisines = Array.isArray(chef.cuisineTypes)
    ? chef.cuisineTypes
    : typeof chef.cuisineTypes === 'string'
    ? chef.cuisineTypes.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECE7] p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFDF8] border border-[#E8ECE7] flex items-center justify-center text-[#14513F] font-bold text-xl shadow-xs shrink-0 overflow-hidden relative">
            {chef.profileImage ? (
              <img
                src={chef.profileImage}
                alt={kitchenName}
                className="w-full h-full object-cover"
              />
            ) : (
              <ChefHat className="w-7 h-7 text-[#14513F]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[#27352F] text-base truncate group-hover:text-[#14513F] transition-colors">
                {kitchenName}
              </h3>
              <span title="Verified Home Kitchen" className="shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
            </div>
            <p className="text-xs text-[#737B76] truncate mt-0.5">
              By Chef {ownerName}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#737B76] mt-1.5">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F6A23A] shrink-0" />
                <span className="truncate">{city}</span>
              </div>

              {chef.distanceKm !== undefined && (
                <span className="px-2 py-0.5 rounded-full bg-[#14513F]/10 text-[#14513F] font-bold text-[11px]">
                  {chef.distanceKm} km away
                </span>
              )}

              {rating > 0 && (
                <div className="flex items-center gap-0.5 text-amber-600 font-bold text-[11px]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{rating.toFixed(1)}</span>
                  {reviewCount > 0 && (
                    <span className="text-[#737B76] font-normal">({reviewCount})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Radius Indicator */}
        <div className="mb-3 px-2.5 py-1 rounded-lg bg-[#F7F8F5] border border-[#E8ECE7] flex items-center justify-between text-[11px] text-[#737B76]">
          <span>Service Area:</span>
          <span className="font-bold text-[#14513F]">Within {serviceRadius} km radius</span>
        </div>

        {chef.description && (
          <p className="text-xs text-[#737B76] line-clamp-2 leading-relaxed mb-3">
            {chef.description}
          </p>
        )}

        {/* Cuisine Pills */}
        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cuisines.slice(0, 3).map((cuisine, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#F7F8F5] border border-[#E8ECE7] text-[11px] font-semibold text-[#14513F]"
              >
                {cuisine}
              </span>
            ))}
            {cuisines.length > 3 && (
              <span className="text-[11px] font-semibold text-[#737B76] self-center">
                +{cuisines.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Available Food Highlights */}
        {sampleFoods.length > 0 && (
          <div className="mb-3 pt-2.5 border-t border-dashed border-[#E8ECE7]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#737B76] flex items-center gap-1 mb-1.5">
              <UtensilsCrossed className="w-3 h-3 text-[#F6A23A]" />
              <span>Available Dishes:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sampleFoods.slice(0, 2).map((item, idx) => (
                <span
                  key={item._id || idx}
                  className="px-2 py-0.5 rounded-md bg-[#FFFDF8] border border-[#F6A23A]/30 text-[11px] text-[#27352F] font-medium"
                >
                  {item.name} <strong className="text-[#14513F]">₹{item.price}</strong>
                </span>
              ))}
              {sampleFoods.length > 2 && (
                <span className="text-[11px] text-[#737B76] self-center font-medium">
                  +{sampleFoods.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <Link
        to={`/chef/${chefId}`}
        className="inline-flex items-center justify-between w-full pt-3 border-t border-[#E8ECE7] text-xs font-bold text-[#14513F] hover:text-[#0E3B2E] transition-colors"
      >
        <span>View Kitchen & Menu</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#F6A23A]" />
      </Link>
    </div>
  );
};

export default ChefCard;
